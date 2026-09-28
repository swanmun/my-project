import { siteConfig } from "@/lib/site";

// Halftone Footer: 잉크 바탕에 거대한 워드마크
export default function Footer() {
  return (
    <footer style={{ background: "var(--ink-900)", color: "var(--white)", padding: "120px 24px 16px", marginTop: "auto" }}>
      <div className="ht-display" style={{ textAlign: "center", fontSize: "clamp(48px,10vw,140px)", letterSpacing: "-0.06em", lineHeight: 0.9 }}>
        {siteConfig.name}
      </div>
      <div className="ht-label" style={{ display: "flex", justifyContent: "space-between", marginTop: 120, gap: 16, flexWrap: "wrap" }}>
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <span style={{ display: "flex", gap: 16 }}>
          <a href="https://github.com/swanmun/my-project">GitHub</a>
        </span>
        <span>Made in Seoul</span>
      </div>
    </footer>
  );
}
