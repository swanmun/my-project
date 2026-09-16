import PagePlaceholder from "@/components/common/PagePlaceholder";

export default async function EditItemPage({ params }: PageProps<"/items/[id]/edit">) {
  const { id } = await params;

  return (
    <PagePlaceholder
      title={`수정하기 (#${id})`}
      feature="2. 핵심기능 - 수정"
      todos={["기존 데이터 불러와 폼 채우기", "작성자 본인 확인", "update 후 상세로 이동"]}
    />
  );
}
