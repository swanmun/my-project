import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function SignupPage() {
  return (
    <PagePlaceholder
      title="회원가입"
      feature="1. 로그인/회원가입"
      todos={[
        "회원가입 폼 (이메일, 비밀번호, 닉네임)",
        "Supabase Auth signUp 연동",
        "가입 후 프로필(profiles) 테이블 저장",
      ]}
    />
  );
}
