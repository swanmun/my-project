import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function ItemsPage() {
  return (
    <PagePlaceholder
      title="목록"
      feature="2. 핵심기능 - 조회"
      todos={[
        "Supabase items 테이블 목록 조회",
        "검색/필터",
        "페이지네이션",
      ]}
    />
  );
}
