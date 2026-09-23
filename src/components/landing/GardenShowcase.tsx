import Link from "next/link";
import { petalPath } from "@/components/garden/flower";

// 랜딩 페이지 두 번째 작품: 정원. 미리보기 꽃은 고정값으로 그립니다(서버 렌더 일치).
const previewFlowers = [
  { x: 70, y: 150, petals: 7, len: 30, width: 12, outer: "#F7B7C8", inner: "#FFE3C4", core: "#FFE08A", stem: 90, scale: 1.1 },
  { x: 170, y: 175, petals: 5, len: 24, width: 11, outer: "#FFC9A3", inner: "#F9D6E8", core: "#B48CD9", stem: 60, scale: 0.9 },
  { x: 250, y: 140, petals: 8, len: 34, width: 13, outer: "#E3CCF5", inner: "#FFD2DC", core: "#F4A0B5", stem: 110, scale: 1.2 },
  { x: 330, y: 180, petals: 6, len: 26, width: 10, outer: "#FFD6C2", inner: "#D9B3EC", core: "#FFF4E0", stem: 70, scale: 1 },
];

export default function GardenShowcase() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFF4E0_0%,#FFE3D0_55%,#F3DCEF_100%)] text-zinc-800">
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-32">
        {/* 왼쪽: 미리보기 */}
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#FFC9A3]/40 to-[#D9B3EC]/40 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/40 shadow-xl backdrop-blur">
            <svg viewBox="0 0 400 220" className="block h-auto w-full">
              {previewFlowers.map((f, i) => (
                <g key={i} transform={`translate(${f.x} ${f.y})`}>
                  <path d={`M0,0 Q4,${-f.stem / 2} 0,${-f.stem}`} fill="none" stroke="#9CCB9C" strokeWidth={3} strokeLinecap="round" />
                  <ellipse cx={10} cy={-f.stem * 0.45} rx={11} ry={5} fill="#B5D7A8" transform={`rotate(-30 10 ${-f.stem * 0.45})`} />
                  <g transform={`translate(0 ${-f.stem}) scale(${f.scale})`}>
                    {Array.from({ length: f.petals }).map((_, k) => (
                      <path key={`o${k}`} d={petalPath(f.len, f.width)} fill={f.outer} fillOpacity={0.92} transform={`rotate(${(360 / f.petals) * k})`} />
                    ))}
                    {Array.from({ length: f.petals }).map((_, k) => (
                      <path key={`i${k}`} d={petalPath(f.len * 0.6, f.width * 0.7)} fill={f.inner} fillOpacity={0.9} transform={`rotate(${(360 / f.petals) * k + 180 / f.petals})`} />
                    ))}
                    <circle r={f.width * 0.55} fill={f.core} />
                  </g>
                </g>
              ))}
            </svg>
            <div className="flex items-center justify-center gap-2 border-t border-white/60 bg-white/50 px-4 py-3 text-xs text-zinc-600">
              <span className="rounded-full bg-[#E8935A] px-3 py-1 font-semibold text-white">피우기</span>
              <span className="px-2">바람</span>
              <span className="px-2">밤</span>
              <span className="px-2">지우기</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 카피 + CTA */}
        <div className="order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800/10 bg-white/50 px-3 py-1 text-xs font-medium tracking-wide text-[#C96A8E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8935A]" />
            두 번째 작품
          </span>
          <h2 className="mt-6 text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
            정원,
            <br />
            <span className="bg-gradient-to-r from-[#E8935A] via-[#D98CA8] to-[#A379D1] bg-clip-text text-transparent">
              누를 때마다 핍니다.
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-600">
            버튼을 누르거나 아무 곳이나 누르면 매번 다른 파스텔 꽃이 피어납니다. 바람을 불면 흔들리고, 밤이 되면 꽃이 빛납니다.
            글도 설명도 없이, 그냥 보고 놀기 위한 페이지입니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/garden"
              className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              정원 열기
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                ↗
              </span>
            </Link>
            <span className="text-sm text-zinc-500">스크롤 · 버튼 · 클릭</span>
          </div>
        </div>
      </div>
    </section>
  );
}
