import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function MyPaymentsPage() {
  return (
    <PagePlaceholder
      title="결제내역"
      feature="4. 결제 - 내역/취소"
      todos={[
        "내 payments 목록 조회",
        "상태 표시 (완료/취소)",
        "결제 취소 버튼 → /api/payments/cancel",
      ]}
    />
  );
}
