"""
꼬맨틀 정답 후보(secrets.txt) 전체에 대해 상위 1,000개 이웃을 미리 계산한다.

사이트가 보여주는 세 숫자:
  - 가장 유사한 단어의 유사도      -> 1위 이웃
  - 10번째로 유사한 단어의 유사도  -> 10위 이웃
  - 1,000번째로 유사한 단어의 유사도 -> 1000위 이웃
이 세 값을 후보별 '지문(fingerprint)'으로 저장해두면, 사이트 숫자만으로 정답을 찾을 수 있다.

실행: python precompute.py   (한 번만 실행하면 됨)
"""

import pickle
import time
from pathlib import Path

import numpy as np

DATA_DIR = Path(r"C:\Users\mmm\Downloads\semantle-ko\semantle-ko\data")
K = 1000       # 상위 몇 개 이웃을 저장할지 (사이트와 동일하게 1000)
CHUNK = 128    # 한 번에 계산할 후보 수. 메모리 부족하면 줄이기


def load_data():
    with open(DATA_DIR / "valid_nearest.pkl", "rb") as f:
        words, vecs = pickle.load(f)
    vecs = np.asarray(vecs, dtype=np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)                     
    vecs = np.divide(vecs, norms, out=np.zeros_like(vecs), where=norms > 0)

    with open(DATA_DIR / "secrets.txt", encoding="utf-8") as f:
        secrets = [line.strip() for line in f if line.strip()]
    return list(words), vecs, secrets


def main():
    words, vecs, secrets = load_data()
    word2idx = {w: i for i, w in enumerate(words)}
    n = len(secrets)
    print(f"어휘 {len(words):,}개, 정답 후보 {n:,}개")

    nb_idx = np.full((n, K), -1, dtype=np.int32)          # 이웃 단어 인덱스 (유사도 내림차순)
    nb_sim = np.full((n, K), np.nan, dtype=np.float32)    # 이웃 유사도 (0~1)
    fp = np.full((n, 3), np.nan, dtype=np.float32)        # 지문: 1위, 10위, 1000위 (x100)

    valid_rows = [r for r, s in enumerate(secrets) if s in word2idx]
    missing = n - len(valid_rows)
    if missing:
        print(f"경고: 어휘에 없는 후보 {missing}개는 건너뜀")

    t0 = time.time()
    for start in range(0, len(valid_rows), CHUNK):
        rows = valid_rows[start:start + CHUNK]
        self_idx = [word2idx[secrets[r]] for r in rows]

        sims = vecs[self_idx] @ vecs.T                     # (배치, 어휘수)
        sims[np.arange(len(rows)), self_idx] = -np.inf     # 자기 자신 제외

        top = np.argpartition(sims, -K, axis=1)[:, -K:]    # 상위 K개 (정렬 안 됨)
        top_sims = np.take_along_axis(sims, top, axis=1)
        order = np.argsort(-top_sims, axis=1)              # 내림차순 정렬
        top = np.take_along_axis(top, order, axis=1)
        top_sims = np.take_along_axis(top_sims, order, axis=1)

        nb_idx[rows] = top
        nb_sim[rows] = top_sims
        fp[rows, 0] = top_sims[:, 0] * 100
        fp[rows, 1] = top_sims[:, 9] * 100
        fp[rows, 2] = top_sims[:, K - 1] * 100

        done = min(start + CHUNK, len(valid_rows))
        print(f"\r{done:,}/{len(valid_rows):,}  ({time.time() - t0:.0f}초)", end="")

    out = DATA_DIR / "komantle_index.npz"
    np.savez_compressed(out, secrets=np.array(secrets), fp=fp, nb_idx=nb_idx, nb_sim=nb_sim)
    print(f"\n저장 완료: {out}")

    # 지문 중복 확인: 같은 지문(소수 둘째 자리 기준)을 가진 후보가 있는지
    rounded = np.round(fp[valid_rows], 2)
    _, counts = np.unique(rounded, axis=0, return_counts=True)
    print(f"지문이 겹치는 그룹 수: {(counts > 1).sum()} (0이면 세 숫자만으로 항상 한방에 맞힘)")


if __name__ == "__main__":
    main()
