import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import KomantleShowcase from "@/components/landing/KomantleShowcase";
import GardenShowcase from "@/components/landing/GardenShowcase";

// 소개(랜딩) 페이지
export default function Home() {
  return (
    <>
      <KomantleShowcase />
      <GardenShowcase />
      <Hero />
      <Features />
    </>
  );
}
