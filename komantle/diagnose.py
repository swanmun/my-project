"""
solver.py와 같은 폴더에서 실행: python diagnose.py
정답 단어는 출력하지 않고 숫자만 보여준다.
"""

import numpy as np

from solver import KomantleSolver

TARGET = np.array([52.97, 45.92, 29.64])  # 사이트 상단 세 숫자
DAY = 1630                                 # 오늘 회차 번호

s = KomantleSolver()

print("=== 1. 데이터 기본 정보 ===")
print("어휘 수:", len(s.words))
print("벡터 shape:", s.vecs.shape, "dtype:", s.vecs.dtype)
print("정답 후보 수:", len(s.secrets))
print("어휘에 없는 후보 수:", int((s.sec_vocab < 0).sum()))

print("\n=== 2. NaN 확인 ===")
print("NaN 지문 개수:", int(np.isnan(s.fp).any(axis=1).sum()), "/", len(s.fp))
print("0벡터 개수:", int((np.abs(s.vecs).sum(axis=1) == 0).sum()))

print("\n=== 3. 오늘 회차 지문 vs 사이트 ===")
if DAY < len(s.fp):
    print(f"{DAY}회차 지문:", np.round(s.fp[DAY], 2))
    print("사이트 값   :", TARGET)
    print("차이        :", np.round(s.fp[DAY] - TARGET, 4))
else:
    print(f"후보 수가 {len(s.fp)}개라 {DAY}번 인덱스가 없음")

print("\n=== 4. 사이트 값과 가장 가까운 지문 5개 ===")
diff = np.abs(s.fp - TARGET)
dist = np.where(np.isnan(diff).any(axis=1), np.inf, diff.max(axis=1))
for i in np.argsort(dist)[:5]:
    print(f"#{i:<5} 지문 {np.round(s.fp[i], 2)}  최대오차 {dist[i]:.4f}")

print("\n=== 5. 지문 값 분포 (정상이면 1위 40~70, 1000위 20~40 정도) ===")
valid = ~np.isnan(s.fp).any(axis=1)
for name, col in zip(["1위", "10위", "1000위"], s.fp[valid].T):
    print(f"{name:<6} 최소 {col.min():6.2f}  평균 {col.mean():6.2f}  최대 {col.max():6.2f}")

print("\n=== 6. 29.64가 몇 위인지 ===")
sims = s.nb_sim[DAY] * 100
r = int(np.argmin(np.abs(sims - TARGET[2])))
print(f"가장 가까운 순위: {r + 1}위, 값 {sims[r]:.4f}")
print("주변 값:", [(i + 1, round(float(sims[i]), 3)) for i in range(max(r - 3, 0), min(r + 4, len(sims)))])

print("\n=== 7. 1위+10위만으로 몇 개가 남나 ===")
mask = np.all(np.abs(s.fp[:, :2] - TARGET[:2]) <= 0.006, axis=1)
print("후보 수:", int(mask.sum()))