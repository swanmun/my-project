import { CornerFrame, Halftone, NoteColumn, Page, Tag, Window } from "@/components/ds";
import Image from "next/image";
import { komantleOriginalUrl, komantleSolverUrl } from "@/lib/site";

// 랜딩 작품 1: 꼬맨틀 솔버. Halftone "Field" 섹션(핑크 단색 바탕 + OS 창 데모)
function SolverField() {
  return (
    <div className="ht-field" style={{ position: "relative", minHeight: 440, boxShadow: "0 0 0 1px var(--cocoa-800)", color: "var(--cocoa-800)", marginTop: 24 }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "var(--dot-grid)", opacity: 0.35 }} />
      <Halftone
        blobs={[
          ["70%", "20%", "34%", "70%", "var(--ink-900)", true],
          ["2%", "55%", "30%", "60%", "var(--ink-900)", true],
        ]}
      />
      <Tag style={{ position: "absolute", left: 0, top: 0 }}>KOMANTLE.SOLVER</Tag>

      {/* 실제 솔버 화면의 카드 1·2·3을 OS 창으로 */}
      <Window className="ht-field-win" title="1. 세 숫자 입력" tone="white" width={300} style={{ position: "absolute", left: "4%", top: 40 }} padding={8}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontVariantNumeric: "tabular-nums" }}>
          {[
            ["1위", "52.97"],
            ["10위", "45.92"],
            ["1,000위", "29.64"],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="ht-label">{l}</div>
              <div style={{ boxShadow: "inset 0 0 0 1px var(--ink-900)", padding: "2px 4px", marginTop: 2, fontSize: 15 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
          <Tag>찾기</Tag>
          <span style={{ fontSize: 12 }}>1630번째 꼬맨틀 · 정답을 찾았습니다.</span>
        </div>
      </Window>

      <Window className="ht-field-win" title="2. 정답 보기" width={170} style={{ position: "absolute", right: "6%", top: 70 }}>
        <Tag tone="accent">정답 확정</Tag>
        <div style={{ marginTop: 6 }}>스포일러입니다.<br />버튼을 눌러야 보입니다.</div>
      </Window>

      <Window className="ht-field-win" title="3. 힌트 받기" tone="white" width="min(360px, 80%)" style={{ position: "absolute", left: "30%", top: 220 }} padding={8}>
        <div style={{ fontSize: 13 }}>
          바위: 유사도 <b style={{ fontVariantNumeric: "tabular-nums" }}>38.12</b> (약 100위) · 보통
        </div>
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {[
            ["절벽", "43.4"],
            ["산등성이", "43.1"],
            ["폭포", "42.9"],
            ["능선", "42.7"],
            ["암벽", "42.5"],
          ].map(([w, s]) => (
            <Tag key={w} tone="outline">
              {w} {s}
            </Tag>
          ))}
        </div>
      </Window>

      <Window className="ht-field-win" title="komantle-solver" width={200} style={{ position: "absolute", left: 8, bottom: 8 }}>
        서버 없음 · 외부 요청 0<br />Cloudflare Workers
      </Window>
    </div>
  );
}

export default function KomantleShowcase() {
  return (
    <Page bg="var(--surface-field)" fg="var(--fg-on-field)" style={{ paddingBottom: "var(--section-pad)" }}>
      {/* 원본 꼬맨틀이 무엇인지 먼저 보여줌: 실제 화면 캡처 + 솔버가 읽는 세 숫자 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--column-gap)", alignItems: "center", paddingTop: 48 }}>
        <Window title="semantle-ko.newsjel.ly · 꼬맨틀 원본" tone="white" padding={0} className="ht-field-win">
          <a href={komantleOriginalUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
            <Image src="/komantle-original.png" alt="꼬맨틀 원본 화면: 정답 단어와 가장 유사한 단어의 유사도, 10번째, 1,000번째 유사도가 적힌 첫 화면" width={640} height={370} style={{ display: "block", width: "100%", height: "auto" }} />
          </a>
        </Window>
        <div>
          <Tag>What Is 꼬맨틀</Tag>
          <p style={{ fontSize: 22, lineHeight: 1.3, letterSpacing: "-0.02em", marginTop: 16, textWrap: "pretty" }}>
            꼬맨틀은 뉴스젤리가 만든 한국어 단어 유사도 추측 게임입니다. 매일 정답 단어 하나가 정해지고, 추측한 단어가 정답과 얼마나 가까운지 유사도 점수로만 알려줍니다.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.35, letterSpacing: "-0.015em", marginTop: 16 }}>
            첫 화면에 적힌 세 숫자(가장 유사한 단어, 10번째, 1,000번째의 유사도)가 이 솔버가 읽는 전부입니다. 원본은{" "}
            <a href={komantleOriginalUrl} target="_blank" rel="noopener noreferrer">
              semantle-ko.newsjel.ly
            </a>
            에서 직접 해볼 수 있습니다.
          </p>
        </div>
      </div>

      <SolverField />

      <CornerFrame padding="24px 0" style={{ marginTop: 48 }}>
        <h2 className="ht-display" style={{ fontSize: "clamp(40px, 7vw, 96px)", textAlign: "center" }}>
          꼬맨틀, 오늘은 꼭 맞힙니다
        </h2>
      </CornerFrame>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--column-gap)", marginTop: 64 }}>
        <NoteColumn label="Three Numbers">꼬맨틀 첫 화면의 문장을 그대로 붙여넣으면 1위·10위·1,000위 유사도를 자동으로 읽고, 4,650개 후보의 지문과 대조해 정답을 특정합니다.</NoteColumn>
        <NoteColumn label="Not A Spoiler">정답은 버튼 뒤에 숨깁니다. 대신 내가 친 단어보다 한 걸음 더 가까운 단어만 건넵니다. 조금·보통·많이, 원하는 만큼만.</NoteColumn>
        <NoteColumn label="No Server">서버도 외부 요청도 없이 브라우저 안에서만 계산합니다. 어휘 59,118개의 단어 벡터를 정적 파일로 배포합니다.</NoteColumn>
      </div>

      <CornerFrame padding="24px 0" style={{ marginTop: 96 }}>
        <div className="ht-display" style={{ fontSize: "clamp(48px, 8vw, 112px)" }}>
          후보 4,650개,
          <br />
          외부 요청 0.
        </div>
        <div className="ht-label" style={{ marginTop: 16 }}>
          *브라우저 정적 계산 기준{" "}
          <a href={komantleSolverUrl} target="_blank" rel="noopener noreferrer">
            (솔버 열기)
          </a>
        </div>
      </CornerFrame>
    </Page>
  );
}
