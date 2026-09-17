import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import KomantleShowcase from "@/components/landing/KomantleShowcase";

// 소개(랜딩) 페이지
export default function Home() {
  return (
    <>
      <KomantleShowcase />
      <Hero />
      <Features />
    </>
  );
}
