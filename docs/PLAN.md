# 프로젝트 기획

## 1. 개요 (미정)
- 서비스명:
- 한 줄 소개:
- 타겟 사용자:
- 해결하려는 문제:

## 2. 과제 요구사항 ↔ 페이지 매핑

| # | 요구사항 | 페이지 / API | 사용 기술 | 상태 |
|---|---|---|---|---|
| 1 | 로그인/회원가입 | `/login`, `/signup`, `/mypage` | Supabase Auth | ☐ |
| 2 | 핵심기능 CRUD | `/items`, `/items/new`, `/items/[id]`, `/items/[id]/edit` | Supabase DB, Storage | ☐ |
| 3 | 지도/위치 | `/map`, 상세 페이지 미니 지도 | 카카오맵 SDK | ☐ |
| 4 | 결제/취소/내역 | `/payments/checkout`, `/payments/success`, `/payments/fail`, `/mypage/payments`, `/api/payments/confirm`, `/api/payments/cancel` | 토스페이먼츠 (테스트) | ☐ |
| 5 | 자유 기능 | | | ☐ |

## 3. 데이터 모델 (초안)
타입 정의는 `src/types/index.ts` 참고.

- `profiles`: id(auth.users), nickname, created_at
- `items`: id, user_id, title, description, price, image_url, address, lat, lng, created_at
- `payments`: id, user_id, item_id, order_id, payment_key, amount, status, created_at, canceled_at

## 4. 할 일
- [ ] 프로젝트 주제 정하기 → `src/lib/site.ts`, 랜딩 문구 수정
- [ ] `items`를 실제 도메인 이름으로 변경
- [ ] Supabase 프로젝트 생성, `.env.local` 작성
- [ ] 로그인 보호 페이지용 `src/proxy.ts` 추가 (Next.js 16부터 middleware → proxy)
