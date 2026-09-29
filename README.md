# 나의 프로젝트

새싹 교육 과제용 웹 사이트입니다. 작품 두 점을 소개 페이지에 나란히 올렸습니다.

| 작품 | 무엇 | 주소 |
| --- | --- | --- |
| 꼬맨틀 솔버 | 꼬맨틀 첫 화면의 세 숫자로 정답을 찾고, 정답은 숨긴 채 한 걸음 더 가까운 단어만 힌트로 주는 정적 페이지 | https://komantle-solver.mmmn.workers.dev |
| 정원 | 누를 때마다 다른 파스텔 꽃이 피는 보기용 페이지. 바람·밤·지우기 | https://my-project-beige-rho-63.vercel.app/garden |

소개 페이지: https://my-project-beige-rho-63.vercel.app

과제 요구사항(로그인·CRUD·지도·결제)은 뼈대 페이지만 있습니다. 기획은 `docs/PLAN.md`, PRD는 `docs/PRD.md`, 솔버 원리와 한계는 `docs/솔버-원리.md`.

## 디자인

메인 사이트와 솔버는 claude.ai/design 에서 만든 **Halftone 디자인 시스템**을 따릅니다. 흰·하늘·핑크·세이지·잉크 단색 바탕, OS 창 모양 카드, 모서리 0, 그림자 없음, 서체는 Pretendard Variable 하나.

- 토큰: `src/styles/halftone.css` (`globals.css`가 불러옴)
- 부품: `src/components/ds/index.tsx` — Window, CornerFrame, Kicker, Tag, NoteColumn, Halftone, Edge, Page
- 규칙 전문과 금지 사항: `.claude/skills/halftone-design/`
- 정원은 꽃과 파스텔 배경이 작품이라 그대로 두고, 조작 창·태그만 시스템을 따릅니다.

## 기술 스택

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, `motion` (정원 애니메이션)
- 꼬맨틀 솔버: 순수 HTML/JS, Cloudflare Workers Static Assets
- Supabase · 카카오맵 · 토스페이먼츠 — 예정

## 시작하기

```bash
npm install
cp .env.example .env.local   # 키 값 채우기 (아직 없어도 소개 페이지와 정원은 뜸)
npm run dev                  # http://localhost:3000
```

## 배포

이 저장소는 두 곳에 나눠서 배포합니다.

| 대상 | 방법 | 주소 |
| --- | --- | --- |
| 메인 사이트 + 정원 (Next.js) | **Vercel**, GitHub 연동 자동 배포 | https://my-project-beige-rho-63.vercel.app |
| 꼬맨틀 솔버 (`komantle/`) | **Cloudflare**, 로컬에서 `npm run deploy` | https://komantle-solver.mmmn.workers.dev |

### 메인 사이트 → Vercel

1. https://vercel.com 에서 GitHub 저장소 `swanmun/my-project`를 Import 합니다. 프레임워크는 Next.js로 자동 인식됩니다.
2. Environment Variables에 `.env.example`의 키를 넣습니다. 아직 값이 없으면 비워 두어도 소개 페이지·정원·솔버 링크는 동작합니다.
3. Deploy. 이후 `main`에 push할 때마다 자동으로 다시 배포됩니다.

### 꼬맨틀 솔버 → Cloudflare

데이터 폴더(약 137MB)는 git에 올리지 않으므로 로컬에서만 배포합니다.

```bash
cd komantle
npm run deploy
```

처음 한 번은 `npx wrangler login`이 필요합니다. 새 PC라면 데이터 생성부터 해야 하며, 순서는 `komantle/README.md`에 있습니다.

## 폴더 구조

```
src/
├─ app/
│  ├─ page.tsx               # 소개(랜딩): 히어로 → 솔버(핑크) → 정원(세이지) → 푸터
│  ├─ garden/                # 정원 페이지
│  ├─ (auth)/login, signup   # 1. 로그인/회원가입 (뼈대)
│  ├─ items/                 # 2. 핵심기능 CRUD (뼈대)
│  ├─ map/                   # 3. 지도/위치 (뼈대)
│  ├─ payments/, api/payments/   # 4. 결제 (뼈대)
│  └─ mypage/                #    마이페이지 (뼈대)
├─ components/
│  ├─ ds/                    # Halftone 디자인 시스템 부품
│  ├─ landing/               # HalftoneHero, KomantleShowcase, GardenShowcase
│  ├─ garden/                # Garden(화면·조작), flower(꽃 생성 규칙·팔레트)
│  ├─ layout/                # Header(떠 있는 칩 내비), Footer(잉크 워드마크)
│  └─ common/                # 공용 컴포넌트
├─ styles/halftone.css       # 디자인 토큰
├─ lib/site.ts               # 사이트명, 메뉴, 솔버·꼬맨틀 원본 주소
└─ types/
komantle/                    # 꼬맨틀 솔버 (자세한 내용은 komantle/README.md)
public/komantle-original.png # 소개 페이지에 넣은 꼬맨틀 원본 화면 캡처 (출처: 뉴스젤리)
docs/                        # PLAN.md, PRD.md, 솔버-원리.md
.claude/skills/halftone-design/   # 디자인 규칙 (UI 작업 전 읽기)
```
