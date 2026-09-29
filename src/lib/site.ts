// 사이트 전역 설정: 이름, 소개 문구(검색·공유 미리보기에 쓰임)
export const siteConfig = {
  name: "나의 프로젝트",
  tagline: "꼬맨틀은 풀고, 정원은 피웁니다",
  description: "직접 만든 작품 두 점. 정답은 숨기고 한 걸음 더 가까운 단어만 건네는 꼬맨틀 솔버, 누를 때마다 파스텔 꽃이 피는 정원.",
};

export const komantleSolverUrl = "https://komantle-solver.mmmn.workers.dev";
export const komantleOriginalUrl = "https://semantle-ko.newsjel.ly/"; // 꼬맨틀 원본(뉴스젤리)

export const navItems = [
  { href: komantleSolverUrl, label: "꼬맨틀 솔버" },
  { href: "/garden", label: "정원" },
];
