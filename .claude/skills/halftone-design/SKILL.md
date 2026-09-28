---
name: halftone-design
description: 이 사이트(src/app, src/components)의 UI를 만들거나 고칠 때 따르는 Halftone 디자인 시스템. 색·서체·간격·컴포넌트 규칙과 금지 사항.
user-invocable: true
---

이 프로젝트의 메인 사이트는 claude.ai/design 의 "Halftone Design System"(프로젝트 id 83d65a89-36b2-4905-b4ed-fc0e2a97dc69)을 따릅니다.
UI 작업 전에 같은 폴더의 `README.md`(규칙 전문)를 읽으세요.

코드에서 쓰는 것:
- 토큰: `src/styles/halftone.css` (CSS 변수 `--ink-900`, `--pink-500`, `--font-sans` 등과 `.ht-chip`, `.ht-link`, `.ht-display`, `.ht-label` 클래스)
- 부품: `src/components/ds/index.tsx` — `Window`, `CornerFrame`, `Kicker`, `Tag`, `NoteColumn`, `Halftone`, `Edge`, `Page`
- 서체: Pretendard Variable (layout.tsx 에서 CDN 로드). 다른 서체 금지.

꼭 지킬 것:
- 모서리 반경 0. 둥근 버튼·카드·알약 금지.
- 그림자 금지. 깊이는 1px 잉크 선, OS 베벨(`--bevel-in/out`), 창 겹침으로만.
- 장식용 그라데이션 금지. 배경은 흰색/하늘/핑크/세이지/잉크 단색 한 가지.
- 핑크·세이지 위 글자는 검정이 아니라 코코아(`--fg-on-field`).
- 카드가 필요하면 `Window`. 제목·숫자 블록은 상자 대신 `CornerFrame`.
- 모션은 최소·기계적(즉시 전환, `steps(4)`). 스크롤 페이드·스케일·바운스 금지.
- 이모지 금지. 아이콘이 꼭 필요하면 Lucide 1.5px 스트로크 16/20px.

예외: `/garden`(정원)과 `komantle/`(솔버)은 독립 작품이라 이 시스템을 적용하지 않습니다.
