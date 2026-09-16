import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function LoginPage() {
  return (
    <PagePlaceholder
      title="로그인"
      feature="1. 로그인/회원가입"
      todos={[
        "이메일/비밀번호 로그인 폼",
        "Supabase Auth signInWithPassword 연동",
        "소셜 로그인(카카오/구글) - 선택",
      ]}
    />
  );
}
