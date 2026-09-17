// 실행: node --test komantle/test
// 정답 단어는 출력하지 않는다. 비교 결과만 출력한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { matchFingerprint, parseKomantleText, hints, findNeighbor } from "../web/solver.js";

const DATA = new URL("../web_data/komantle-data/", import.meta.url);
const buf = readFileSync(new URL("fp.bin", DATA));
const fp = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);

test("(52.97, 45.92, 29.64) → 1630 정확 일치", () => {
  const r = matchFingerprint(fp, 52.97, 45.92, 29.64);
  assert.deepEqual(r, { candidates: [1630], approx: false });
});

test("1000위 빈값이어도 1630", () => {
  const r = matchFingerprint(fp, 52.97, 45.92, null);
  assert.deepEqual(r, { candidates: [1630], approx: false });
});

test("엉뚱한 값은 approx=true, 후보 1개", () => {
  const r = matchFingerprint(fp, 99, 98, null);
  assert.equal(r.approx, true);
  assert.equal(r.candidates.length, 1);
});

test("안내 문장에서 세 숫자 추출", () => {
  const text =
    "1630번째 꼬맨틀의 정답 단어를 맞혀보세요. 정답 단어와 가장 유사한 단어의 유사도는 52.97 입니다. " +
    "10번째로 유사한 단어의 유사도는 45.92이고, 1,000번째로 유사한 단어의 유사도는 29.64 입니다.";
  const p = parseKomantleText(text);
  assert.equal(p.top, 52.97);
  assert.equal(p.top10, 45.92);
  assert.equal(p.rest, 29.64);
  assert.equal(p.round, 1630);
});

test("힌트: 정답 없음, exclude 반영, 전부 guessSim보다 높음", () => {
  const { a: answer, n: neighbors } = JSON.parse(readFileSync(new URL("n/1630.json", DATA), "utf8"));
  const guessSim = 30;
  const exclude = new Set([neighbors[50][0], neighbors[60][0]]);
  const h = hints(neighbors, guessSim, 0.5, 5, exclude, answer);
  assert.equal(h.length, 5);
  for (const x of h) {
    assert.ok(x.sim > guessSim);
    assert.ok(!exclude.has(x.word));
    assert.notEqual(x.word, answer);
  }
  // 순위 기준: 100위 단어 → 조금 75위, 보통 50위, 많이 20위 근처. 세 단계가 서로 다르다
  const [w100, s100] = neighbors[99];
  const little = hints(neighbors, s100, 0.75, 5, new Set(), answer, 100).map((x) => x.rank);
  const normal = hints(neighbors, s100, 0.5, 5, new Set(), answer, 100).map((x) => x.rank);
  const much = hints(neighbors, s100, 0.2, 5, new Set(), answer, 100).map((x) => x.rank);
  assert.ok(little.every((r) => r >= 73 && r <= 77), `조금 ${little}`);
  assert.ok(normal.every((r) => r >= 48 && r <= 52), `보통 ${normal}`);
  assert.ok(much.every((r) => r >= 18 && r <= 22), `많이 ${much}`);
  // 목록 밖(1,000위 밖) 단어: 1001위 기준 → 많이 = 200위 근처
  const out = hints(neighbors, 10, 0.2, 5, new Set(), answer, null).map((x) => x.rank);
  assert.ok(out.every((r) => r >= 198 && r <= 202), `목록 밖 많이 ${out}`);
  assert.ok(w100.length > 0);
  // 이웃 목록에 정답 자신이 없는지
  assert.equal(findNeighbor(neighbors, answer), null);
  // 이웃 목록 단어는 자동으로 유사도를 찾는다
  const f = findNeighbor(neighbors, neighbors[9][0]);
  assert.equal(f.rank, 10);
  assert.equal(f.sim, neighbors[9][1]);
  // 1위 이상이면 힌트 없음
  assert.equal(hints(neighbors, neighbors[0][1], 0.75, 5, new Set(), answer, 1).length, 0);
});

// ---- 단서(단어 + 유사도) 매칭: 단어 벡터로 어떤 단어든 대조 ----
import { hashWord, matchClues, resolve, SHARDS, DIMS, decodeFloat16, simsToCandidates } from "../web/solver.js";

const candBuf = readFileSync(new URL("cand.bin", DATA));
const cand = decodeFloat16(candBuf.buffer.slice(candBuf.byteOffset, candBuf.byteOffset + candBuf.byteLength));
const vectorLocal = (word) => {
  const k = hashWord(word);
  const words = JSON.parse(readFileSync(new URL(`vec/${k}.json`, DATA), "utf8"));
  const j = words.indexOf(word);
  if (j < 0) return null;
  const b = readFileSync(new URL(`vec/${k}.bin`, DATA));
  return decodeFloat16(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)).subarray(j * DIMS, (j + 1) * DIMS);
};
const clueSimsLocal = (clues) => clues.map((c) => { const v = vectorLocal(c.word); return v ? simsToCandidates(cand, v) : null; });

test("hashWord는 shard 범위 안의 안정된 값 (Python export_vectors.py와 동일)", () => {
  assert.equal(hashWord("돌아앉아"), 392);
  assert.equal(hashWord("a"), 300);
  assert.ok(hashWord("한글테스트") < SHARDS);
});

test("벡터 유사도가 이웃 목록의 유사도와 일치 (오차 0.02 이내)", () => {
  const { n } = JSON.parse(readFileSync(new URL("n/1631.json", DATA), "utf8"));
  const [w, sim] = n[284]; // 돌아앉아 30.80 근처
  const sims = simsToCandidates(cand, vectorLocal(w));
  assert.ok(Math.abs(sims[1631] - sim) <= 0.02, `${sims[1631]} vs ${sim}`);
  assert.equal(w, "돌아앉아");
});

test("1631회차: 지문은 안 맞지만 단서(돌아앉아 30.80)로 1631이 1순위, 단서 2개면 [1631] 특정", () => {
  assert.equal(matchFingerprint(fp, 41.03, 36.09, 25.89).approx, true);
  const one = [{ word: "돌아앉아", sim: 30.8 }];
  const r1 = resolve(fp, 41.03, 36.09, 25.89, one, clueSimsLocal(one));
  assert.equal(r1.byClue, true);
  assert.equal(r1.candidates[0], 1631);
  // 두 번째 단서: 1631 이웃 목록의 500위 단어와 그 유사도(사이트가 보여줄 값)
  const { n } = JSON.parse(readFileSync(new URL("n/1631.json", DATA), "utf8"));
  const two = [...one, { word: n[499][0], sim: n[499][1] }];
  const r2 = resolve(fp, 41.03, 36.09, 25.89, two, clueSimsLocal(two));
  assert.deepEqual(r2, { candidates: [1631], approx: false, byClue: true, clueMiss: false });
});

test("이웃 1,000위 밖의 낮은 유사도 단어도 단서로 동작", () => {
  // 1631의 이웃 목록에 없는 단어를 찾아 실제 유사도를 계산한 뒤 그 값으로 단서를 만든다
  const { n } = JSON.parse(readFileSync(new URL("n/1631.json", DATA), "utf8"));
  const inList = new Set(n.map(([w]) => w));
  const words = JSON.parse(readFileSync(new URL("vec/7.json", DATA), "utf8"));
  const w = words.find((x) => !inList.has(x));
  const sims = simsToCandidates(cand, vectorLocal(w));
  const sim = Math.round(sims[1631] * 100) / 100;
  assert.ok(sim < 25.89, `1000위 밖이어야 함: ${sim}`);
  const r = resolve(fp, 41.03, 36.09, 25.89, [{ word: w, sim }], clueSimsLocal([{ word: w, sim }]));
  assert.ok(r.byClue && r.candidates.includes(1631));
  assert.ok(r.candidates.length <= 3, `후보 ${r.candidates.length}개`);
});

test("어휘에 없는 단어는 clueMiss + 지문 폴백", () => {
  const clues = [{ word: "없는단어zzz", sim: 30 }];
  const r = resolve(fp, 52.97, 45.92, 29.64, clues, clueSimsLocal(clues));
  assert.deepEqual(r.candidates, [1630]);
  assert.equal(r.clueMiss, true);
});

test("단서 없으면 기존 지문 대조와 동일", () => {
  assert.deepEqual(resolve(fp, 52.97, 45.92, 29.64), { candidates: [1630], approx: false, byClue: false, clueMiss: false });
});
