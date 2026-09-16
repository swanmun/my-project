import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function PaymentFailPage() {
  return (
    <PagePlaceholder
      title="결제 실패"
      feature="4. 결제"
      todos={[
        "실패 사유(code, message) 표시",
        "다시 시도 버튼",
      ]}
    />
  );
}
