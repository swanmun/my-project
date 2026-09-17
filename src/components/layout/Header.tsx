import Link from "next/link";
import { komantleSolverUrl, navItems, siteConfig } from "@/lib/site";

export default function Header() {
  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="whitespace-nowrap text-lg font-bold">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.href === komantleSolverUrl
                  ? "whitespace-nowrap font-medium hover:underline"
                  : "hidden whitespace-nowrap hover:underline sm:inline" // 모바일에서는 핵심 메뉴만 표시
              }
            >
              {item.label}
            </Link>
          ))}
          {/* TODO: 로그인 상태에 따라 로그인/로그아웃 전환 */}
          <Link
            href="/login"
            className="whitespace-nowrap rounded-md bg-zinc-900 px-3 py-1.5 text-white"
          >
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}
