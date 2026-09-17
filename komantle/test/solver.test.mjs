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
  const h = hints(neighbors, guessSim, 5, 5, exclude, answer);
  assert.equal(h.length, 5);
  for (const x of h) {
    assert.ok(x.sim > guessSim);
    assert.ok(!exclude.has(x.word));
    assert.notEqual(x.word, answer);
  }
  // 이웃 목록에 정답 자신이 없는지
  assert.equal(findNeighbor(neighbors, answer), null);
  // 이웃 목록 단어는 자동으로 유사도를 찾는다
  const f = findNeighbor(neighbors, neighbors[9][0]);
  assert.equal(f.rank, 10);
  assert.equal(f.sim, neighbors[9][1]);
  // 1위 이상이면 힌트 없음
  assert.equal(hints(neighbors, neighbors[0][1], 2, 5, new Set(), answer).length, 0);
});
