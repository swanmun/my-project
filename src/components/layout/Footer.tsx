import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-500">
        © {new Date().getFullYear()} {siteConfig.name}
      </div>
    </footer>
  );
}
