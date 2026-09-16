import PagePlaceholder from "@/components/common/PagePlaceholder";

export default async function ItemDetailPage({ params }: PageProps<"/items/[id]">) {
  const { id } = await params;

  return (
    <PagePlaceholder
      title={`상세 (#${id})`}
      feature="2. 핵심기능 - 조회/삭제"
      todos={[
        "id로 단건 조회",
        "작성자에게만 수정/삭제 버튼 노출",
        "위치 미니 지도",
        "결제하기 버튼 → /payments/checkout",
      ]}
    />
  );
}
