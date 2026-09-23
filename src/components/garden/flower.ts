// 꽃 한 송이의 모양을 무작위로 만듭니다. 매번 다른 꽃이 핍니다.

export type Flower = {
  id: number;
  x: number; // 페이지 안 좌표(px)
  y: number;
  petals: number; // 바깥 꽃잎 개수
  len: number; // 꽃잎 길이
  width: number; // 꽃잎 폭
  outer: string; // 바깥 꽃잎 색
  inner: string; // 안쪽 꽃잎 색
  core: string; // 꽃 중심 색
  stem: number; // 줄기 길이
  lean: number; // 줄기 기울기(도)
  leafSide: 1 | -1;
  scale: number;
};

// 따뜻한 파스텔: 피치·크림·라일락·로즈
export const petalColors = [
  "#FFC9A3", "#FFD6C2", "#FFB3A0", "#F7B7C8", "#FFD2DC",
  "#E3CCF5", "#D9B3EC", "#FFE3C4", "#F9D6E8", "#FFC7B8",
];
const coreColors = ["#FFE08A", "#FFF4E0", "#B48CD9", "#F4A0B5", "#FFD3A3"];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

let nextId = 1;

export function makeFlower(x: number, y: number): Flower {
  const outer = pick(petalColors);
  let inner = pick(petalColors);
  if (inner === outer) inner = pick(petalColors);
  return {
    id: nextId++,
    x,
    y,
    petals: Math.floor(rand(5, 10)),
    len: rand(26, 44),
    width: rand(9, 18),
    outer,
    inner,
    core: pick(coreColors),
    stem: rand(50, 130),
    lean: rand(-10, 10),
    leafSide: Math.random() < 0.5 ? 1 : -1,
    scale: rand(0.8, 1.25),
  };
}

// 꽃잎 하나의 path (중심에서 위로 뻗는 물방울 모양)
export function petalPath(len: number, width: number) {
  return `M0,0 C${width},${-len / 3} ${width},${-len * 0.8} 0,${-len} C${-width},${-len * 0.8} ${-width},${-len / 3} 0,0 Z`;
}
