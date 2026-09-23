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

        {/* 오른쪽: 화면 미리보기 카드 (실제 솔버와 같은 밝은 테마) */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-xs text-zinc-500">komantle-solver.mmmn.workers.dev</span>
            </div>

            {/* 실제 솔버: 배경 #f6f7f9, 흰 카드, 파란 버튼 #1f6feb */}
            <div className="space-y-3 bg-[#f6f7f9] p-4 text-[#1c1f24]">
              <div>
                <p className="text-base font-bold">꼬맨틀 솔버</p>
                <p className="text-[11px] text-[#6b7280]">서버 없이 브라우저에서만 계산합니다.</p>
              </div>

              <div className="rounded-xl border border-[#e3e5e8] bg-white p-3">
                <p className="text-sm font-semibold">1. 세 숫자 입력</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    ["1위", "52.97"],
                    ["10위", "45.92"],
                    ["1,000위", "29.64"],
                  ].map(([label, value]) => (
                    <label key={label} className="text-[11px] text-[#1c1f24]">
                      {label}
                      <div className="mt-0.5 rounded-lg border border-[#e3e5e8] bg-white px-2 py-1.5 font-mono text-sm">{value}</div>
                    </label>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="rounded-lg bg-[#1f6feb] px-3.5 py-1.5 text-xs font-medium text-white">찾기</span>
                  <span className="text-[11px] text-[#6b7280] underline">전체 초기화</span>
                </div>
                <p className="mt-2 text-[11px] text-[#6b7280]">1630번째 꼬맨틀</p>
                <p className="text-xs text-[#15803d]">정답을 찾았습니다.</p>
              </div>

              <div className="rounded-xl border border-[#e3e5e8] bg-white p-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  2. 정답 보기
                  <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-medium text-[#15803d]">정답 확정</span>
                </p>
                <p className="mt-1 text-[11px] text-[#6b7280]">스포일러입니다. 버튼을 눌러야 보입니다.</p>
                <span className="mt-2 inline-block rounded-lg bg-[#1f6feb] px-3.5 py-1.5 text-xs font-medium text-white">정답 보기</span>
              </div>

              <div className="rounded-xl border border-[#e3e5e8] bg-white p-3">
                <p className="text-sm font-semibold">3. 힌트 받기</p>
                <div className="mt-2 flex items-end gap-2">
                  <label className="flex-1 text-[11px]">
                    단어
                    <div className="mt-0.5 rounded-lg border border-[#e3e5e8] bg-white px-2 py-1.5 text-sm">바위</div>
                  </label>
                  <span className="flex gap-2 text-[11px] text-[#1c1f24]">
                    <span>○ 조금</span>
                    <span>● 보통</span>
                    <span>○ 많이</span>
                  </span>
                  <span className="rounded-lg bg-[#1f6feb] px-3.5 py-1.5 text-xs font-medium text-white">힌트</span>
                </div>
                <p className="mt-2 text-xs">바위: 유사도 38.12 (약 100위)</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    ["절벽", "43.4 · 약 52위"],
                    ["산등성이", "43.1 · 약 55위"],
                    ["폭포", "42.9 · 약 58위"],
                    ["능선", "42.7 · 약 60위"],
                    ["암벽", "42.5 · 약 63위"],
                  ].map(([w, s]) => (
                    <span key={w} className="rounded-lg border border-[#e3e5e8] bg-white px-2.5 py-1 text-xs">
                      {w} <span className="text-[10px] text-[#6b7280]">{s}</span>
                    </span>
                  ))}
                </div>
              </div>
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
