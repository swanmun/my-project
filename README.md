# 프로젝트명(미정)

## 기술 스택
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (인증, DB, 스토리지)
- 카카오맵 (지도/위치)
- 토스페이먼츠 (결제)

## 시작하기
```bash
npm install
cp .env.example .env.local   # 키 값 채우기
npm run dev                  # http://localhost:3000
```

## 폴더 구조
```
src/
├─ app/
│  ├─ page.tsx               # 소개(랜딩) 페이지
│  ├─ (auth)/login, signup   # 1. 로그인/회원가입
│  ├─ items/                 # 2. 핵심기능 CRUD (목록/등록/상세/수정)
│  ├─ map/                   # 3. 지도/위치
│  ├─ payments/              # 4. 결제 (checkout/success/fail)
│  ├─ mypage/                #    마이페이지, 결제내역
│  └─ api/payments/          #    결제 승인/취소 API
├─ components/
│  ├─ layout/                # Header, Footer
│  ├─ landing/               # 소개 페이지 섹션
│  └─ common/                # 공용 컴포넌트
├─ lib/
│  ├─ site.ts                # 사이트명, 메뉴 설정
│  └─ supabase/              # Supabase 클라이언트 (client/server)
└─ types/                    # 공용 타입
docs/PLAN.md                 # 기획, 요구사항 매핑, 할 일
```
