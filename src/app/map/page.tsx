import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function MapPage() {
  return (
    <PagePlaceholder
      title="지도로 찾기"
      feature="3. 지도/위치"
      todos={[
        "카카오맵 SDK 로드",
        "items의 lat/lng로 마커 표시",
        "내 위치 기준 가까운 순 정렬",
      ]}
    />
  );
}
