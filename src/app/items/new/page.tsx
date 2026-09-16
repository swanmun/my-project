import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function NewItemPage() {
  return (
    <PagePlaceholder
      title="등록하기"
      feature="2. 핵심기능 - 등록"
      todos={[
        "등록 폼 (제목, 설명, 가격, 이미지, 주소)",
        "이미지 업로드 (Supabase Storage)",
        "로그인 사용자만 접근",
      ]}
    />
  );
}
