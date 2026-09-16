import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function PaymentSuccessPage() {
  return (
    <PagePlaceholder
      title="결제 완료"
      feature="4. 결제"
      todos={[
        "쿼리의 paymentKey/orderId/amount 확인",
        "/api/payments/confirm 호출로 결제 승인",
        "결제 결과 표시",
      ]}
    />
  );
}
