// 배포용 폴더(dist/)를 만든다: web/ 복사 + web_data/komantle-data/ 복사 + _headers 생성
// 실행: npm run build  (Windows PowerShell에서도 동작)
// 참고: 이 환경의 Node에서 fs.cpSync / fs.rmSync(recursive)가 비정상 종료해서 직접 순회한다.
import { existsSync, mkdirSync, readdirSync, copyFileSync, unlinkSync, rmdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const WEB = join(ROOT, "web");
const DATA = join(ROOT, "web_data", "komantle-data");
const DIST = join(ROOT, "dist");

if (!existsSync(join(DATA, "fp.bin")) || !existsSync(join(DATA, "n"))) {
  console.error(`데이터 폴더가 없습니다: ${DATA}\n먼저 komantle 폴더에서 python export_web_data.py 를 실행하세요.`);
  process.exit(1);
}

function removeDir(dir, keepRoot = false) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    e.isDirectory() ? removeDir(p) : unlinkSync(p);
  }
  if (!keepRoot) rmdirSync(dir);
}

function copyDir(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const e of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, e.name);
    const d = join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : copyFileSync(s, d);
  }
}

removeDir(DIST, true); // dist 폴더 자체는 두고 내용만 비운다 (열려 있어도 동작)
copyDir(WEB, DIST);
copyDir(DATA, join(DIST, "komantle-data"));
writeFileSync(join(DIST, "_headers"), "/komantle-data/*\n  Cache-Control: public, max-age=86400\n");

// 결과 요약: 파일 수, 가장 큰 파일 (Cloudflare 무료 한도: 20,000개, 파일당 25MiB)
let count = 0;
let maxSize = 0;
let maxFile = "";
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else {
      count++;
      const size = statSync(p).size;
      if (size > maxSize) { maxSize = size; maxFile = p.slice(DIST.length + 1); }
    }
  }
})(DIST);
console.log(`dist 생성 완료: 파일 ${count}개, 가장 큰 파일 ${maxFile} (${(maxSize / 1024).toFixed(1)} KB)`);
if (count > 20000 || maxSize > 25 * 1024 * 1024) {
  console.error("Cloudflare 무료 한도(20,000개 / 25MiB)를 넘었습니다.");
  process.exit(1);
}
