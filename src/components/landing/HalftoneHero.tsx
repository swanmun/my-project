import Link from "next/link";
import { CornerFrame, Halftone, Kicker, Window } from "@/components/ds";
import { komantleSolverUrl } from "@/lib/site";

// 랜딩 히어로: 하늘색 바탕, 마젠타 하프톤 구름, 크롭 마크 안의 거대한 제목
export default function HalftoneHero() {
  return (
    <section style={{ position: "relative", background: "var(--sky-100)", overflow: "hidden", paddingBottom: 40 }}>
      <Halftone
        blobs={[
          ["-8%", "-10%", "42%", "95%", "var(--magenta-500)"],
          ["-4%", "5%", "30%", "70%", "var(--magenta-500)", true],
          ["68%", "-12%", "44%", "90%", "var(--magenta-500)"],
          ["74%", "10%", "30%", "60%", "var(--magenta-500)", true],
        ]}
      />
      {/* 시스템이 허용하는 유일한 그라데이션: 이미지 아래 흰색으로 사라짐 */}
      <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "linear-gradient(transparent, var(--white) 70%)" }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 150 }}>
        <Window title="소식" width={300} padding="4px 6px" bodyStyle={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
          <span>두 번째 작품 「정원」 공개</span>
          <Link href="/garden">더 보기</Link>
        </Window>

        <div style={{ width: "min(920px, 92%)", marginTop: 48 }}>
          <CornerFrame padding="56px 24px 48px">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
              <Kicker left="작품 두 점" right="하나의 저장소" />
              <h1 className="ht-display" style={{ fontSize: "clamp(48px, 8.4vw, 112px)", textAlign: "center" }}>
                꼬맨틀은 풀고, 정원은 피웁니다
              </h1>
              <div style={{ display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
                <a href={komantleSolverUrl} target="_blank" rel="noopener noreferrer" className="ht-link ht-link--md">
                  솔버 열기
                </a>
                <Link href="/garden" className="ht-link ht-link--md">
                  정원 열기
                </Link>
              </div>
            </div>
          </CornerFrame>
        </div>
      </div>
    </section>
  );
}
