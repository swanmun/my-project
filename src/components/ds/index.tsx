import type { CSSProperties, ReactNode } from "react";

// Halftone Design System 기본 부품 (React 서버 컴포넌트, 인라인 스타일)
// 원본: claude.ai/design "Halftone Design System" components/

/** OS 창. 잉크 타이틀바 + 1px 프레임 + 회색(베벨) 또는 흰 본문 */
export function Window({
  title,
  children,
  tone = "gray",
  width,
  padding = 6,
  style,
  bodyStyle,
  className,
}: {
  className?: string;
  title?: ReactNode;
  children: ReactNode;
  tone?: "gray" | "white" | "inset";
  width?: number | string;
  padding?: number | string;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}) {
  const bg = tone === "white" ? "var(--white)" : tone === "inset" ? "var(--gray-300)" : "var(--surface-window)";
  return (
    <div
      className={className}
      style={{
        width,
        background: bg,
        boxShadow: "0 0 0 1px var(--ink-900)",
        color: "var(--ink-900)",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {title != null && (
        <div
          style={{
            height: "var(--titlebar-h)",
            background: "var(--titlebar-bg)",
            color: "var(--titlebar-fg)",
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            padding: "0 4px",
            letterSpacing: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          padding,
          margin: 2,
          boxShadow: tone === "gray" ? "var(--bevel-in)" : "none",
          flex: 1,
          fontSize: 14,
          lineHeight: 1.35,
          ...bodyStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** 네 귀퉁이 크롭 마크. 상자 대신 제목·숫자 블록을 감쌈 */
export function CornerFrame({
  children,
  size = 10,
  color = "currentColor",
  padding = "24px 0",
  style,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  padding?: string;
  style?: CSSProperties;
}) {
  const b = `1px solid ${color}`;
  const c = (pos: CSSProperties): CSSProperties => ({ position: "absolute", width: size, height: size, ...pos });
  return (
    <div style={{ position: "relative", padding, ...style }}>
      <span aria-hidden style={{ ...c({ top: 0, left: 0 }), borderTop: b, borderLeft: b }} />
      <span aria-hidden style={{ ...c({ top: 0, right: 0 }), borderTop: b, borderRight: b }} />
      <span aria-hidden style={{ ...c({ bottom: 0, left: 0 }), borderBottom: b, borderLeft: b }} />
      <span aria-hidden style={{ ...c({ bottom: 0, right: 0 }), borderBottom: b, borderRight: b }} />
      {children}
    </div>
  );
}

/** 점선 리더가 있는 아이브로우: "왼쪽 ······ 오른쪽" */
export function Kicker({ left, right, style }: { left: ReactNode; right?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4, fontSize: 15, fontWeight: 500, letterSpacing: "-0.02em", whiteSpace: "nowrap", ...style }}>
      <span>{left}</span>
      {right != null && (
        <>
          <span aria-hidden style={{ flex: "0 1 90px", minWidth: 24, borderBottom: "1.5px dotted currentColor", transform: "translateY(-3px)" }} />
          <span>{right}</span>
        </>
      )}
    </div>
  );
}

/** 작은 사각 태그 */
export function Tag({ tone = "ink", children, style }: { tone?: "ink" | "accent" | "outline" | "paper"; children: ReactNode; style?: CSSProperties }) {
  const t: Record<string, CSSProperties> = {
    ink: { background: "var(--ink-900)", color: "var(--white)" },
    accent: { background: "var(--magenta-500)", color: "var(--ink-900)" },
    outline: { background: "transparent", color: "currentColor", boxShadow: "inset 0 0 0 1px currentColor" },
    paper: { background: "var(--white)", color: "var(--ink-900)" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        padding: "0 4px",
        fontSize: 12,
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        ...t[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** 왼쪽 1px 세로 선에 매단 라벨 + 문단 */
export function NoteColumn({
  label,
  children,
  dashed = false,
  size = "lg",
  style,
}: {
  label: ReactNode;
  children: ReactNode;
  dashed?: boolean;
  size?: "lg" | "sm";
  style?: CSSProperties;
}) {
  return (
    <div style={{ borderLeft: `1px ${dashed ? "dashed" : "solid"} currentColor`, padding: "0 0 0 8px", display: "flex", flexDirection: "column", gap: size === "lg" ? 48 : 40, ...style }}>
      <div className="ht-label">{label}</div>
      <div style={{ fontSize: size === "lg" ? 22 : 16, lineHeight: 1.25, letterSpacing: "-0.02em", textWrap: "pretty" }}>{children}</div>
    </div>
  );
}

/** 하프톤 점 덩어리(구름). [x, y, w, h, color, fine?] */
export type Blob = [string, string, string, string, string, boolean?];
export function Halftone({ blobs }: { blobs: Blob[] }) {
  return (
    <>
      {blobs.map(([x, y, w, h, color, fine], i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            color,
            background: fine ? "var(--dot-grid-fine)" : "var(--dot-grid)",
            WebkitMaskImage: "radial-gradient(closest-side, #000 40%, transparent)",
            maskImage: "radial-gradient(closest-side, #000 40%, transparent)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

/** 섹션 가장자리 글리프 "∵ ×" */
export function Edge({ color = "currentColor" }: { color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, color, padding: "8px 0" }}>
      <span>∵ ×</span>
      <span>× ∵</span>
    </div>
  );
}

/** 단색 바탕의 전폭 섹션 + 가운데 1240px 컬럼 */
export function Page({ bg, fg, children, style, inner }: { bg: string; fg: string; children: ReactNode; style?: CSSProperties; inner?: CSSProperties }) {
  return (
    <section style={{ background: bg, color: fg, position: "relative", overflow: "hidden", ...style }}>
      <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "0 var(--page-gutter)", position: "relative", ...inner }}>{children}</div>
    </section>
  );
}
