import { komantleSolverUrl } from "@/lib/site";

// 랜딩 페이지 메인 쇼케이스: 꼬맨틀 솔버
const steps = [
  {
    no: "01",
    title: "세 숫자 붙여넣기",
    description: "꼬맨틀 첫 화면의 안내 문장을 그대로 붙여넣으면 1위·10위·1,000위 유사도를 자동으로 읽습니다.",
  },
  {
    no: "02",
    title: "정답 찾기",
    description: "4,650개 후보의 지문과 대조해 정답을 특정합니다. 정답은 스포일러 확인을 거쳐야만 보입니다.",
  },
  {
    no: "03",
    title: "단계별 힌트",
    description: "내가 친 단어보다 조금 더 가까운 단어를 골라 줍니다. 조금·보통·많이, 원하는 만큼만 다가가세요.",
  },
];

export default function KomantleShowcase() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      {/* 배경 장식 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.25),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-32">
        {/* 왼쪽: 카피 + CTA */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            지금 사용 가능
          </span>
          <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            꼬맨틀,
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-emerald-300 bg-clip-text text-transparent">
              오늘은 꼭 맞힙니다.
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-300">
            화면 위 세 숫자만 넣으면 정답을 찾아내고, 내가 친 단어보다 한 걸음 더 가까운 단어를 힌트로 건네는
            꼬맨틀 솔버입니다. 서버도, 외부 요청도 없이 브라우저 안에서만 계산합니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={komantleSolverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_20px_60px_-15px_rgba(99,102,241,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_24px_70px_-15px_rgba(99,102,241,0.9)]"
            >
              솔버 열기
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
            <span className="text-sm text-zinc-400">설치 없음 · 로그인 없음 · 무료</span>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">정답 후보</dt>
              <dd className="mt-1 text-2xl font-semibold">4,650</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">이웃 단어</dt>
              <dd className="mt-1 text-2xl font-semibold">1,000<span className="text-base text-zinc-400">개/정답</span></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">외부 요청</dt>
              <dd className="mt-1 text-2xl font-semibold">0</dd>
            </div>
          </dl>
        </div>

        {/* 오른쪽: 화면 미리보기 카드 */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 blur-2xl" aria-hidden />
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-xs text-zinc-500">꼬맨틀 솔버</span>
            </div>

            <p className="mt-5 text-xs text-zinc-500">1. 세 숫자 입력</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                ["1위", "52.97"],
                ["10위", "45.92"],
                ["1,000위", "29.64"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5">
                  <div className="text-[10px] text-zinc-500">{label}</div>
                  <div className="mt-0.5 font-mono text-lg text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              <span>정답을 찾았습니다.</span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-zinc-300">정답 보기 · 가려짐</span>
            </div>

            <p className="mt-6 text-xs text-zinc-500">3. 힌트 받기</p>
            <div className="mt-2 rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm">
              <span className="text-zinc-400">내 단어</span>
              <span className="ml-2 text-white">바위</span>
              <span className="ml-2 text-zinc-500">유사도 38.12 · 약 100위</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                ["절벽", "43.4"],
                ["산등성이", "43.1"],
                ["폭포", "42.9"],
                ["능선", "42.7"],
                ["암벽", "42.5"],
              ].map(([w, s]) => (
                <span
                  key={w}
                  className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-100"
                >
                  {w} <span className="text-xs text-indigo-300/70">{s}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 3단계 */}
      <div className="relative border-t border-white/10">
        <ol className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.no} className="flex gap-4">
              <span className="font-mono text-sm text-indigo-300">{s.no}</span>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
