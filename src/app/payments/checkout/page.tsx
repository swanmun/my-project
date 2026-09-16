import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function CheckoutPage() {
  return (
    <PagePlaceholder
      title="결제하기"
      feature="4. 결제"
      todos={[
        "주문 정보 확인",
        "토스페이먼츠 결제위젯 연동",
        "orderId 생성 후 결제 요청",
      ]}
    />
  );
}
