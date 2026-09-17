# 꼬맨틀 솔버

꼬맨틀 첫 화면의 세 숫자(1위·10위·1,000위 유사도)로 정답을 찾고, 입력한 단어보다 조금 더 유사한 단어를 힌트로 보여주는 정적 웹페이지입니다.

- 서버 코드 없음. 모든 계산은 브라우저에서 정적 파일만으로 합니다.
- 외부 API 호출 없음. 꼬맨틀 사이트를 호출하거나 크롤링하지 않습니다.
- 배포: Cloudflare Workers Static Assets (무료 플랜)

## 폴더 구조

```
komantle/
  precompute.py        FastText → komantle_index.npz (이웃·지문 계산)
  export_web_data.py   npz → web_data/komantle-data/ (웹용 데이터, git 제외)
  web/                 페이지 소스 (index.html, app.js, solver.js, style.css)
  test/                Node 테스트
  scripts/build.mjs    web/ + 데이터 → dist/ 조립
  wrangler.jsonc       Cloudflare 설정 (정적 자산 전용)
  dist/                배포 결과물 (git 제외)
```

## 1. 데이터 준비

`komantle` 폴더에서 순서대로 실행합니다.

```
python precompute.py
python export_web_data.py
```

`web_data/komantle-data/` 에 `fp.bin`, `meta.json`, `n/0.json` … `n/4649.json` 이 생깁니다. 약 97MB이며 git에 올리지 않습니다.

## 2. 테스트·로컬 확인

```
cd komantle
npm test        # 로직 테스트 (1630회차 기준)
npm run dev     # dist 조립 후 http://127.0.0.1:8787 에서 확인
```

## 3. 배포

처음 한 번만 Cloudflare 로그인:

```
npx wrangler login
```

이후 배포는 명령 하나:

```
cd komantle
npm run deploy
```

`build`(dist 조립) → `wrangler deploy` 순서로 실행되고, 끝나면 `https://komantle-solver.<계정>.workers.dev` 주소가 출력됩니다.

- 배포는 로컬에서만 합니다. 데이터가 git에 없으므로 GitHub 연동 자동 배포는 쓰지 않습니다.
- 데이터를 다시 만들었으면(`export_web_data.py` 재실행) `npm run deploy` 를 다시 실행하면 됩니다. 데이터 파일은 하루(`max-age=86400`) 캐시되므로 방문자에게는 최대 하루 뒤에 반영됩니다.

## 4. 사용법

1. 꼬맨틀 첫 화면 상단 문장을 복사해 붙여넣거나, 1위·10위(필수)·1,000위(선택) 숫자를 입력하고 **찾기**.
2. **정답 보기** 버튼 → 확인 대화상자 → 정답 표시. 누르기 전까지는 가려져 있습니다.
3. **힌트 받기**: 꼬맨틀에 입력한 단어를 적으면 유사도·순위가 자동으로 나오고, 그보다 조금 더 유사한 단어 5개를 보여줍니다. 이웃 1,000개 밖의 단어는 꼬맨틀에 나온 유사도를 직접 입력합니다.
   힌트 단계: 조금(+2) / 보통(+5) / 많이(+10).
4. 세 숫자와 입력 기록은 브라우저 `localStorage`에만 저장됩니다. 다른 세 숫자를 입력하면 기록이 초기화됩니다.

알려진 차이: 꼬맨틀 서버 어휘가 로컬보다 약간 많아서 로컬 순위가 사이트 순위보다 몇 칸 뒤로 나올 수 있습니다.

## 출처

데이터·규칙 출처: 꼬맨틀(뉴스젤리), FastText.
