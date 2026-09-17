# 프로젝트명(미정)

새싹 교육 과제용 웹 서비스입니다. 현재 완성된 기능은 **꼬맨틀 솔버**이며, 나머지(로그인·CRUD·지도·결제)는 뼈대만 있습니다.

## 꼬맨틀 솔버

꼬맨틀 첫 화면의 세 숫자(1위·10위·1,000위 유사도)로 정답을 찾고, 입력한 단어보다 조금 더 유사한 단어를 힌트로 보여주는 정적 웹페이지입니다.

- 배포 주소: https://komantle-solver.msw4118.workers.dev
- 메인 사이트: https://my-project-beige-rho-63.vercel.app
- 소스: `komantle/` (자세한 사용법·배포 방법은 `komantle/README.md`)
- 서버 코드 없음, 외부 API 호출 없음. 모든 계산은 브라우저에서 정적 파일만으로 합니다.

## 기술 스택

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (인증, DB, 스토리지) — 예정
- 카카오맵 (지도/위치) — 예정
- 토스페이먼츠 (결제) — 예정
- 꼬맨틀 솔버: 순수 HTML/JS, Cloudflare Workers Static Assets

## 시작하기

```bash
npm install
cp .env.example .env.local   # 키 값 채우기 (아직 없어도 랜딩 페이지는 뜸)
npm run dev                  # http://localhost:3000
```

## 배포

이 저장소는 두 곳에 나눠서 배포합니다.

| 대상 | 방법 | 주소 |
| --- | --- | --- |
| 메인 사이트 (Next.js) | **Vercel**, GitHub 연동 자동 배포 | https://my-project-beige-rho-63.vercel.app |
| 꼬맨틀 솔버 (`komantle/`) | **Cloudflare**, 로컬에서 `npm run deploy` | https://komantle-solver.msw4118.workers.dev |

### 메인 사이트 → Vercel

1. https://vercel.com 에서 GitHub 저장소 `swanmun/my-project`를 Import 합니다. 프레임워크는 Next.js로 자동 인식됩니다.
2. Environment Variables에 `.env.example`의 키를 넣습니다. 아직 값이 없으면 비워 두어도 랜딩 페이지와 솔버 링크는 동작합니다.
3. Deploy. 이후 `main`에 push할 때마다 자동으로 다시 배포됩니다.

### 꼬맨틀 솔버 → Cloudflare

데이터 폴더(97MB)는 git에 올리지 않으므로 로컬에서만 배포합니다.

```bash
cd komantle
npm run deploy
```

처음 한 번은 `npx wrangler login`이 필요합니다. 데이터 생성부터 하려면 `komantle/README.md`를 보세요.

## 폴더 구조

```
src/
├─ app/
│  ├─ page.tsx               # 소개(랜딩) 페이지 — 꼬맨틀 솔버 쇼케이스
│  ├─ (auth)/login, signup   # 1. 로그인/회원가입
│  ├─ items/                 # 2. 핵심기능 CRUD (목록/등록/상세/수정)
│  ├─ map/                   # 3. 지도/위치
│  ├─ payments/              # 4. 결제 (checkout/success/fail)
│  ├─ mypage/                #    마이페이지, 결제내역
│  └─ api/payments/          #    결제 승인/취소 API
├─ components/
│  ├─ layout/                # Header, Footer
│  ├─ landing/               # 소개 페이지 섹션 (KomantleShowcase, Hero, Features)
│  └─ common/                # 공용 컴포넌트
├─ lib/
│  ├─ site.ts                # 사이트명, 메뉴, 솔버 주소
│  └─ supabase/              # Supabase 클라이언트 (client/server)
└─ types/                    # 공용 타입
komantle/
├─ web/                      # 솔버 페이지 소스
├─ scripts/build.mjs         # 배포 폴더(dist) 조립
├─ precompute.py, export_web_data.py   # 데이터 생성
└─ README.md                 # 솔버 사용법·배포
docs/PLAN.md                 # 기획, 요구사항 매핑, 할 일
```
