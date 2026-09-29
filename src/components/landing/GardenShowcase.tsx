import Link from "next/link";
import { CornerFrame, Edge, NoteColumn, Page, Tag, Window } from "@/components/ds";
import { petalPath } from "@/components/garden/flower";

// 랜딩 작품 2: 정원. Halftone "Quiet" 섹션(세이지 단색 바탕). 미리보기 꽃은 고정값(서버 렌더 일치).
const previewFlowers = [
  { x: 70, y: 150, petals: 7, len: 30, width: 12, outer: "#F7B7C8", inner: "#FFE3C4", core: "#FFE08A", stem: 90, scale: 1.1 },
  { x: 170, y: 175, petals: 5, len: 24, width: 11, outer: "#FFC9A3", inner: "#F9D6E8", core: "#B48CD9", stem: 60, scale: 0.9 },
  { x: 250, y: 140, petals: 8, len: 34, width: 13, outer: "#E3CCF5", inner: "#FFD2DC", core: "#F4A0B5", stem: 110, scale: 1.2 },
  { x: 330, y: 180, petals: 6, len: 26, width: 10, outer: "#FFD6C2", inner: "#D9B3EC", core: "#FFF4E0", stem: 70, scale: 1 },
];

export default function GardenShowcase() {
  return (
    <Page bg="var(--surface-quiet)" fg="var(--fg-on-field)" style={{ paddingBottom: "var(--section-pad)" }}>
      <Edge />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--column-gap)", alignItems: "center", marginTop: 40 }}>
        <Window title="garden 0.01" tone="white" padding={0}>
          <svg viewBox="0 0 400 220" style={{ display: "block", width: "100%", height: "auto", background: "#FFF4E0" }}>
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
          <div style={{ display: "flex", gap: 4, padding: 6, borderTop: "1px solid var(--ink-900)" }}>
            <Tag>피우기</Tag>
            <Tag tone="outline">바람</Tag>
            <Tag tone="outline">밤</Tag>
            <Tag tone="outline">지우기</Tag>
          </div>
        </Window>

        <div>
          <Tag tone="paper">두 번째 작품</Tag>
          <CornerFrame padding="24px 0" style={{ marginTop: 16 }}>
            <h2 className="ht-display" style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>
              정원,
              <br />
              누를 때마다 핍니다
            </h2>
          </CornerFrame>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24, marginTop: 32 }}>
            <NoteColumn size="sm" label="Bloom">버튼이나 화면을 누르면 매번 다른 파스텔 꽃.</NoteColumn>
            <NoteColumn size="sm" label="Wind / Night">바람에 흔들리고, 밤에는 빛납니다.</NoteColumn>
            <NoteColumn size="sm" label="Clear">지우면 꽃잎이 흩날리며 사라집니다.</NoteColumn>
          </div>
          <div style={{ marginTop: 48 }}>
            <Link href="/garden" className="ht-link ht-link--md">
              정원 열기
            </Link>
          </div>
        </div>
      </div>
    </Page>
  );
}
