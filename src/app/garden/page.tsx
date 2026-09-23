import type { Metadata } from "next";
import Garden from "@/components/garden/Garden";

export const metadata: Metadata = {
  title: "정원",
  description: "누를 때마다 파스텔 꽃이 피어나는 정원",
};

// 보여주기용 정원 페이지. 헤더/푸터 위에 전체 화면으로 덮습니다.
export default function GardenPage() {
  return <Garden />;
}
