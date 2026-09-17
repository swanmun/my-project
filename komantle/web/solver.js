// 꼬맨틀 솔버 핵심 로직. 브라우저와 Node 테스트에서 함께 사용한다.
// 외부 호출 없음. 모든 계산은 로컬 데이터(fp.bin, n/{i}.json)만으로 한다.

export const DATA_BASE = "./komantle-data";

/** 세 숫자(1위, 10위, 1000위)로 정답 후보 인덱스를 찾는다. rest는 선택. */
export function matchFingerprint(fp, top, top10, rest, tol = 0.006) {
  const exact = [];
  let best = -1;
  let bestErr = Infinity;
  const hasRest = rest !== null && rest !== undefined && !Number.isNaN(rest);
  for (let i = 0; i < fp.length / 3; i++) {
    const a = fp[i * 3];
    const b = fp[i * 3 + 1];
    const c = fp[i * 3 + 2];
    const err = Math.max(Math.abs(a - top), Math.abs(b - top10));
    if (err <= tol && (!hasRest || rest >= c - tol)) exact.push(i);
    if (err < bestErr) {
      bestErr = err;
      best = i;
    }
  }
  return exact.length
    ? { candidates: exact, approx: false }
    : { candidates: [best], approx: true };
}

export const SHARDS = 512;

/** FNV-1a 32bit. 역색인 shard 번호. scripts/build-index.mjs도 이 함수를 쓴다. */
export function hashWord(word) {
  let h = 0x811c9dc5;
  for (const ch of word) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % SHARDS;
}

/**
 * 단서(꼬맨틀에서 친 단어 + 유사도)로 후보를 좁힌다.
 * lookups: 단어별 역색인 결과 [[후보 인덱스, 유사도], ...] (없으면 null)
 * 반환: 모든 단서를 만족하는 후보 인덱스 배열. 단서가 없으면 null.
 */
export function matchClues(clues, lookups, tol = 0.02) {
  if (!clues.length) return null;
  let set = null;
  clues.forEach((c, k) => {
    const hits = new Set((lookups[k] || []).filter(([, sim]) => Math.abs(sim - c.sim) <= tol).map(([i]) => i));
    set = set === null ? hits : new Set([...set].filter((i) => hits.has(i)));
  });
  return [...set];
}

/**
 * 세 숫자 + 단서를 합쳐 최종 후보를 정한다.
 * - 단서가 있으면 단서 결과를 우선하고, 여러 개면 지문 오차가 작은 순으로 정렬한다.
 * - 단서가 없으면 지문 대조만 쓴다.
 * 반환: { candidates, approx, byClue }
 */
export function resolve(fp, top, top10, rest, clues = [], lookups = []) {
  const fpErr = (i) => Math.max(Math.abs(fp[i * 3] - top), Math.abs(fp[i * 3 + 1] - top10));
  const byClue = matchClues(clues, lookups);
  if (byClue && byClue.length) {
    return { candidates: byClue.sort((a, b) => fpErr(a) - fpErr(b)), approx: false, byClue: true };
  }
  const r = matchFingerprint(fp, top, top10, rest);
  return { ...r, byClue: false, clueMiss: !!(byClue && !byClue.length) };
}

/** 꼬맨틀 안내 문장에서 세 숫자와 회차를 뽑는다. 못 찾으면 null. */
export function parseKomantleText(text) {
  const nums = (text.match(/\d+(?:\.\d+)?/g) || []).map(Number);
  // 회차: "N번째 꼬맨틀" 또는 "#N" 형태
  const roundMatch = text.match(/(\d+)\s*번째\s*꼬맨틀/) || text.match(/#\s*(\d+)/);
  const round = roundMatch ? Number(roundMatch[1]) : null;
  // 유사도 값: 소수점이 있는 숫자만 (10, 1,000 같은 순위 숫자 제외)
  const sims = (text.match(/\d+\.\d+/g) || []).map(Number);
  if (sims.length < 2) return null;
  return {
    top: sims[0],
    top10: sims[1],
    rest: sims.length >= 3 ? sims[2] : null,
    round,
    allNumbers: nums,
  };
}

/** 이웃 목록에서 guessSim보다 조금 더 높은 단어 n개를 고른다. 정답은 항상 제외. */
export function hints(neighbors, guessSim, step, n = 5, exclude = new Set(), answer = null) {
  const target = guessSim + step;
  return neighbors
    .map(([word, sim], i) => ({ word, sim, rank: i + 1 }))
    .filter((h) => h.sim > guessSim && !exclude.has(h.word) && h.word !== answer)
    .sort((x, y) => Math.abs(x.sim - target) - Math.abs(y.sim - target))
    .slice(0, n)
    .sort((x, y) => y.sim - x.sim);
}

/** 이웃 목록에서 단어를 찾는다. 없으면 null. */
export function findNeighbor(neighbors, word) {
  const i = neighbors.findIndex(([w]) => w === word);
  return i < 0 ? null : { word, sim: neighbors[i][1], rank: i + 1 };
}

// ---- 데이터 로더 (브라우저 전용, 각 파일은 한 번만 받는다) ----
let fpCache = null;
const neighborCache = new Map();

export async function loadFingerprint(base = DATA_BASE) {
  if (!fpCache) {
    const res = await fetch(`${base}/fp.bin`);
    if (!res.ok) throw new Error("fp.bin 로딩 실패");
    fpCache = new Float32Array(await res.arrayBuffer());
  }
  return fpCache;
}

const shardCache = new Map();

/** 단어의 역색인 항목을 돌려준다: [[후보 인덱스, 유사도], ...] 또는 null. shard 파일은 한 번만 받는다. */
export async function lookupWord(word, base = DATA_BASE) {
  const k = hashWord(word);
  if (!shardCache.has(k)) {
    const res = await fetch(`${base}/idx/${k}.json`);
    if (!res.ok) throw new Error("단어 색인 로딩 실패");
    shardCache.set(k, await res.json());
  }
  return shardCache.get(k)[word] ?? null;
}

export async function loadNeighbors(index, base = DATA_BASE) {
  if (!neighborCache.has(index)) {
    const res = await fetch(`${base}/n/${index}.json`);
    if (!res.ok) throw new Error(`이웃 데이터(${index}) 로딩 실패`);
    neighborCache.set(index, await res.json());
  }
  return neighborCache.get(index);
}
