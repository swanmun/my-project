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

export async function loadNeighbors(index, base = DATA_BASE) {
  if (!neighborCache.has(index)) {
    const res = await fetch(`${base}/n/${index}.json`);
    if (!res.ok) throw new Error(`이웃 데이터(${index}) 로딩 실패`);
    neighborCache.set(index, await res.json());
  }
  return neighborCache.get(index);
}
