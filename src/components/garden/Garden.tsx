"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { makeFlower, petalPath, type Flower } from "./flower";

const MAX_FLOWERS = 400;
const PAGE_HEIGHT = "300vh"; // 스크롤하면 정원이 아래로 이어집니다

export default function Garden() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [night, setNight] = useState(false);
  const [wind, setWind] = useState(0); // 바람 버튼을 누른 횟수. 바뀔 때마다 한 번 흔들림
  // 장식은 마운트 후(클라이언트)에만 만들어 서버/클라이언트 불일치를 피합니다
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const deco = useMemo(
    () => (mounted ? { stars: makeDots(70, 1, 3, 0, 3, 0), pollen: makeDots(24, 3, 8, -20, 0, 14) } : null),
    [mounted],
  );

  const plant = useCallback((x: number, y: number) => {
    setFlowers((prev) => [...prev.slice(-MAX_FLOWERS + 1), makeFlower(x, y)]);
  }, []);

  // 화면 안 아무 곳에나 한 송이
  const bloomRandom = () => {
    const el = containerRef.current;
    if (!el) return;
    const x = 40 + Math.random() * (el.clientWidth - 80);
    const y = el.scrollTop + 80 + Math.random() * (el.clientHeight - 200);
    plant(x, y);
  };

  // 땅을 누르면 그 자리에 핌
  const onGroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    plant(e.clientX - rect.left, e.clientY - rect.top + el.scrollTop);
  };

  // 처음 열면 몇 송이 먼저 피워 둡니다
  useEffect(() => {
    const t = [0, 350, 700].map((d) => setTimeout(bloomRandom, d));
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blowWind = () => setWind((w) => w + 1);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto select-none"
      style={{
        background: night
          ? "linear-gradient(180deg, #2E2447 0%, #5B4A85 60%, #8E7CC3 100%)"
          : "linear-gradient(180deg, #FFF4E0 0%, #FFE3D0 55%, #F3DCEF 100%)",
        transition: "background 1.2s ease",
      }}
    >
      {/* 밤하늘 별 */}
      <AnimatePresence>
        {night && deco && (
          <motion.div
            key="stars"
            aria-hidden
            className="pointer-events-none fixed inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            {deco.stars.map((s, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white animate-twinkle"
                style={{ left: s.x, top: s.y, width: s.r, height: s.r, animationDelay: s.d }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 떠다니는 꽃가루 */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        {deco?.pollen.map((p, i) => (
          <span
            key={i}
            className={`absolute rounded-full ${night ? "bg-white/50" : "bg-white/80"} animate-pollen`}
            style={{ left: p.x, top: p.y, width: p.r, height: p.r, animationDelay: p.d, animationDuration: p.t }}
          />
        ))}
      </div>

      {/* 땅: 누르면 그 자리에 꽃이 핍니다 */}
      <div className="relative w-full cursor-crosshair" style={{ height: PAGE_HEIGHT }} onClick={onGroundClick}>
        <AnimatePresence>
          {flowers.map((f, i) => (
            <FlowerSprite key={f.id} f={f} night={night} wind={wind} order={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* 조작 창: Halftone OS 창. 꽃과 배경은 작품이라 그대로, 조작 UI만 시스템을 따른다 */}
      <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2 bg-white shadow-[0_0_0_1px_#1e1e1e]">
        <div className="flex h-5 items-center bg-[#1e1e1e] px-1.5 text-[13px] font-medium text-white">garden 0.01</div>
        <div className="flex items-center gap-1 p-1.5">
          <button type="button" onClick={bloomRandom} className="ht-chip ht-chip--solid">
            피우기
          </button>
          <Ctl onClick={blowWind}>바람</Ctl>
          <Ctl onClick={() => setNight((n) => !n)}>{night ? "낮" : "밤"}</Ctl>
          <Ctl onClick={() => setFlowers([])}>지우기</Ctl>
        </div>
      </div>

      <p className="pointer-events-none fixed top-4 left-4 z-10 inline-flex h-[18px] items-center bg-[#1e1e1e] px-1 text-[12px] font-medium text-white">
        GARDEN 0.01 · 아무 곳이나 눌러 보세요
      </p>
    </div>
  );
}

function Ctl({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="ht-chip">
      {children}
    </button>
  );
}

// ---------- 꽃 한 송이 ----------
// 지우기 때 꽃잎이 바람에 날리듯 오른쪽 위로 흩어진다. 꽃마다·꽃잎마다 방향이 조금씩 다르다(id 기반 고정 난수).
const seeded = (a: number, b: number) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };

function FlowerSprite({ f, night, wind, order }: { f: Flower; night: boolean; wind: number; order: number }) {
  const baseDelay = Math.min(order * 0.012, 0.5) + seeded(f.id, 99) * 0.25;
  const petalExit = (i: number) => ({
    x: 60 + 90 * seeded(f.id, i),
    y: -(40 + 130 * seeded(f.id, i + 50)),
    rotate: 120 + 240 * seeded(f.id, i + 100),
    opacity: 0,
    transition: { duration: 1.1 + 0.4 * seeded(f.id, i + 150), delay: baseDelay + i * 0.04, ease: "easeIn" as const },
  });
  const outerPath = petalPath(f.len, f.width);
  const innerPath = petalPath(f.len * 0.6, f.width * 0.7);
  const size = f.len * 2 + 20;
  const sway = useAnimation();

  // 바람: wind 값이 바뀔 때마다 한 번 흔들림 (꽃은 다시 피지 않음)
  useEffect(() => {
    if (!wind) return;
    const delay = Math.random() * 0.3;
    sway.start({ rotate: [0, 9, -7, 5, -3, 0], transition: { duration: 2.2, ease: "easeInOut", delay } });
  }, [wind, sway]);

  const petalStyle = { transformBox: "fill-box" as const, transformOrigin: "50% 100%" };

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: f.x, top: f.y, width: 0, height: 0, transformOrigin: "0px 0px" }}
      animate={sway}
      exit={{ opacity: 0, transition: { duration: 0.5, delay: baseDelay + 0.9 } }}
    >
      <svg
        width={size}
        height={size + f.stem}
        viewBox={`${-size / 2} ${-(size + f.stem)} ${size} ${size + f.stem}`}
        style={{
          position: "absolute",
          left: -size / 2,
          top: -(size + f.stem),
          overflow: "visible",
          filter: night ? `drop-shadow(0 0 10px ${f.outer})` : "drop-shadow(0 6px 10px rgba(120,80,60,0.12))",
          transition: "filter 1s",
        }}
      >
        {/* 줄기: 아래에서 위로 자람 */}
        <motion.path
          d={`M0,0 Q${f.lean},${-f.stem / 2} 0,${-f.stem}`}
          fill="none"
          stroke={night ? "#B9C9A9" : "#9CCB9C"}
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          exit={{ pathLength: 0, transition: { duration: 0.6, delay: baseDelay + 0.6, ease: "easeIn" } }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        {/* 잎 */}
        <g transform={`translate(${f.leafSide * 2} ${-f.stem * 0.45}) rotate(${f.leafSide * -30})`}>
          <motion.ellipse
            cx={f.leafSide * 11}
            cy={0}
            rx={12}
            ry={5}
            fill={night ? "#B9C9A9" : "#B5D7A8"}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.4, delay: baseDelay + 0.5 } }}
            transition={{ delay: 0.35, duration: 0.4 }}
            style={{ transformBox: "fill-box", transformOrigin: f.leafSide > 0 ? "0% 50%" : "100% 50%" }}
          />
        </g>
        {/* 꽃: 줄기 끝에서 핌. 회전은 g, 펼침(scale)은 path 에 따로 둡니다 */}
        <g transform={`translate(0 ${-f.stem}) scale(${f.scale})`}>
          {Array.from({ length: f.petals }).map((_, i) => (
            <g key={`o${i}`} transform={`rotate(${(360 / f.petals) * i})`}>
              <motion.path
                d={outerPath}
                fill={f.outer}
                fillOpacity={0.92}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={petalExit(i)}
                transition={{ delay: 0.55 + i * 0.06, type: "spring", stiffness: 160, damping: 12 }}
                style={petalStyle}
              />
            </g>
          ))}
          {Array.from({ length: f.petals }).map((_, i) => (
            <g key={`i${i}`} transform={`rotate(${(360 / f.petals) * i + 180 / f.petals})`}>
              <motion.path
                d={innerPath}
                fill={f.inner}
                fillOpacity={0.9}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={petalExit(i + 20)}
                transition={{ delay: 0.75 + i * 0.05, type: "spring", stiffness: 160, damping: 12 }}
                style={petalStyle}
              />
            </g>
          ))}
          <motion.circle
            r={f.width * 0.55}
            fill={f.core}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.4, delay: baseDelay + 0.7 } }}
            transition={{ delay: 1.0, type: "spring", stiffness: 200, damping: 10 }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          />
        </g>
      </svg>
    </motion.div>
  );
}

// 장식(별·꽃가루) 위치
type Dot = { x: string; y: string; r: string; d: string; t: string };
function makeDots(n: number, rMin: number, rMax: number, dMin: number, dMax: number, tBase: number): Dot[] {
  return Array.from({ length: n }, () => ({
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    r: `${rMin + Math.random() * (rMax - rMin)}px`,
    d: `${dMin + Math.random() * (dMax - dMin)}s`,
    t: `${tBase + Math.random() * 12}s`,
  }));
}
