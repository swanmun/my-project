import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function MyPage() {
  return (
    <PagePlaceholder
      title="마이페이지"
      feature="1. 로그인/회원가입"
      todos={[
        "내 정보 표시/수정",
        "내가 등록한 목록",
        "결제내역 바로가기",
      ]}
    />
  );
}
