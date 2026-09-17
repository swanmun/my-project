// 단어 → 후보 역색인 생성: web_data/komantle-data/n/*.json → web_data/komantle-data/idx/{shard}.json
// 브라우저는 단서 단어의 shard 파일 하나만 받아서 "이 단어가 이 유사도로 들어 있는 후보"를 찾는다.
// 실행: npm run index  (export_web_data.py 실행 후 한 번)
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { hashWord, SHARDS } from "../web/solver.js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA = join(ROOT, "web_data", "komantle-data");
const N_DIR = join(DATA, "n");
const IDX = join(DATA, "idx");

if (!existsSync(N_DIR)) {
  console.error(`데이터 폴더가 없습니다: ${N_DIR}\n먼저 python export_web_data.py 를 실행하세요.`);
  process.exit(1);
}

const files = readdirSync(N_DIR).filter((f) => f.endsWith(".json"));
const shards = Array.from({ length: SHARDS }, () => ({}));
for (const f of files) {
  const i = Number(f.slice(0, -5));
  const { n } = JSON.parse(readFileSync(join(N_DIR, f), "utf8"));
  for (const [word, sim] of n) {
    const s = shards[hashWord(word)];
    (s[word] ??= []).push([i, sim]);
  }
}

mkdirSync(IDX, { recursive: true });
for (const old of readdirSync(IDX)) unlinkSync(join(IDX, old));
let maxSize = 0;
shards.forEach((s, k) => {
  const text = JSON.stringify(s);
  maxSize = Math.max(maxSize, text.length);
  writeFileSync(join(IDX, `${k}.json`), text);
});
const words = shards.reduce((a, s) => a + Object.keys(s).length, 0);
console.log(`역색인 생성 완료: 후보 ${files.length}개, 단어 ${words}개, shard ${SHARDS}개, 최대 ${(maxSize / 1024).toFixed(0)} KB`);
