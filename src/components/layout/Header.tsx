import Link from "next/link";
import { komantleSolverUrl, navItems, siteConfig } from "@/lib/site";

// Halftone TopNav: 바 배경 없이 칩만 떠 있는 상단 내비
export default function Header() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 8,
        left: 0,
        right: 0,
        zIndex: 40,
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "start",
        padding: "0 8px",
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <Link href="/" className="ht-chip" style={{ fontWeight: 500 }}>
          {siteConfig.name}
        </Link>
      </div>
      <div style={{ display: "flex", gap: 3, pointerEvents: "auto" }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.href === komantleSolverUrl || item.href === "/garden" ? "ht-chip" : "ht-chip max-sm:hidden"}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div />
    </nav>
  );
}
