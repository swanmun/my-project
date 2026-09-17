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

export const DIMS = 300;

/** float16(리틀엔디언) 버퍼 → Float32Array */
export function decodeFloat16(buffer) {
  const u16 = new Uint16Array(buffer);
  const out = new Float32Array(u16.length);
  for (let i = 0; i < u16.length; i++) {
    const h = u16[i];
    const sign = h & 0x8000 ? -1 : 1;
    const exp = (h >> 10) & 0x1f;
    const frac = h & 0x3ff;
    if (exp === 0) out[i] = sign * frac * 2 ** -24;
    else if (exp === 31) out[i] = frac ? NaN : sign * Infinity;
    else out[i] = sign * (1 + frac / 1024) * 2 ** (exp - 15);
  }
  return out;
}

/** 단어 벡터와 모든 후보 벡터의 코사인 유사도 ×100 (벡터는 정규화돼 있음) */
export function simsToCandidates(cand, vec) {
  const n = cand.length / DIMS;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let dot = 0;
    const off = i * DIMS;
    for (let d = 0; d < DIMS; d++) dot += cand[off + d] * vec[d];
    out[i] = dot * 100;
  }
  return out;
}

/**
 * 단서(꼬맨틀에서 친 단어 + 유사도)로 후보를 좁힌다.
 * clueSims[k]: k번째 단서 단어의 후보별 유사도 배열 (simsToCandidates 결과). 어휘에 없는 단어면 null.
 * 반환: 모든 단서를 만족하는 후보 인덱스 배열. 단서가 없으면 null.
 * tol: float16 반올림 오차(≤0.011)와 사이트 표시 반올림(0.005)을 감안해 0.02.
 * 단어 하나로는 후보가 여럿 남는 경우가 많고(약 80%), 둘이면 99.7%, 셋이면 사실상 100% 특정된다.
 */
export function matchClues(clues, clueSims, tol = 0.02) {
  if (!clues.length) return null;
  let set = null;
  clues.forEach((c, k) => {
    const sims = clueSims[k];
    const hits = new Set();
    if (sims) for (let i = 0; i < sims.length; i++) if (Math.abs(sims[i] - c.sim) <= tol) hits.add(i);
    set = set === null ? hits : new Set([...set].filter((i) => hits.has(i)));
  });
  return [...set];
}

/**
 * 세 숫자 + 단서를 합쳐 최종 후보를 정한다.
 * - 단서가 있으면 단서 결과를 우선하고, 여러 개면 지문 오차가 작은 순으로 정렬한다.
 * - 단서가 없으면 지문 대조만 쓴다.
 * 반환: { candidates, approx, byClue, clueMiss }
 */
export function resolve(fp, top, top10, rest, clues = [], clueSims = []) {
  const fpErr = (i) => Math.max(Math.abs(fp[i * 3] - top), Math.abs(fp[i * 3 + 1] - top10));
  const byClue = matchClues(clues, clueSims);
  if (byClue && byClue.length) {
    return { candidates: byClue.sort((a, b) => fpErr(a) - fpErr(b)), approx: false, byClue: true, clueMiss: false };
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

/**
 * 순위 기준 힌트. 내 단어의 순위(rank, 목록 밖이면 neighbors.length+1)에 factor를 곱한 지점 근처의 단어 n개.
 * factor: 조금 0.75, 보통 0.5, 많이 0.2. 결과는 전부 guessSim보다 높고 정답은 항상 제외.
 */
export function hints(neighbors, guessSim, factor, n = 5, exclude = new Set(), answer = null, rank = null) {
  const r = rank ?? neighbors.length + 1;
  const target = Math.max(1, Math.round(r * factor));
  return neighbors
    .map(([word, sim], i) => ({ word, sim, rank: i + 1 }))
    .filter((h) => h.sim > guessSim && h.rank < r && !exclude.has(h.word) && h.word !== answer)
    .sort((x, y) => Math.abs(x.rank - target) - Math.abs(y.rank - target))
    .slice(0, n)
    .sort((x, y) => y.sim - x.sim);
}

export const HINT_STEPS = { little: 0.75, normal: 0.5, much: 0.2 };

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

let candCache = null;
const vecShardCache = new Map();

/** 후보 벡터(4650×300 float16)를 한 번만 받아 Float32Array로 둔다. */
export async function loadCandidateVectors(base = DATA_BASE) {
  if (!candCache) {
    const res = await fetch(`${base}/cand.bin`);
    if (!res.ok) throw new Error("cand.bin 로딩 실패");
    candCache = decodeFloat16(await res.arrayBuffer());
  }
  return candCache;
}

/** 단어의 벡터(Float32Array 300)를 돌려준다. 어휘에 없으면 null. shard는 한 번만 받는다. */
export async function lookupVector(word, base = DATA_BASE) {
  const k = hashWord(word);
  if (!vecShardCache.has(k)) {
    const [words, bin] = await Promise.all([
      fetch(`${base}/vec/${k}.json`).then((r) => { if (!r.ok) throw new Error("단어 벡터 로딩 실패"); return r.json(); }),
      fetch(`${base}/vec/${k}.bin`).then((r) => { if (!r.ok) throw new Error("단어 벡터 로딩 실패"); return r.arrayBuffer(); }),
    ]);
    vecShardCache.set(k, { words, vecs: decodeFloat16(bin) });
  }
  const { words, vecs } = vecShardCache.get(k);
  const j = words.indexOf(word);
  return j < 0 ? null : vecs.subarray(j * DIMS, (j + 1) * DIMS);
}

export async function loadNeighbors(index, base = DATA_BASE) {
  if (!neighborCache.has(index)) {
    const res = await fetch(`${base}/n/${index}.json`);
    if (!res.ok) throw new Error(`이웃 데이터(${index}) 로딩 실패`);
    neighborCache.set(index, await res.json());
  }
  return neighborCache.get(index);
}
