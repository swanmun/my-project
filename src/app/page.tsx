import HalftoneHero from "@/components/landing/HalftoneHero";
import KomantleShowcase from "@/components/landing/KomantleShowcase";
import GardenShowcase from "@/components/landing/GardenShowcase";

// 소개(랜딩) 페이지: Halftone 디자인 시스템. 히어로 → 솔버(핑크) → 정원(세이지) → 푸터(잉크)
export default function Home() {
  return (
    <>
      <HalftoneHero />
      <KomantleShowcase />
      <GardenShowcase />
    </>
  );
}
