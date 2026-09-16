import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">{siteConfig.tagline}</h1>
      <p className="mx-auto mt-4 max-w-xl text-zinc-500">
        {siteConfig.description}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/items" className="rounded-md bg-zinc-900 px-5 py-2.5 text-white">
          둘러보기
        </Link>
        <Link href="/signup" className="rounded-md border border-zinc-300 px-5 py-2.5">
          시작하기
        </Link>
      </div>
    </section>
  );
}
