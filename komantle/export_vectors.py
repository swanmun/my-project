"""
단어 벡터를 웹용으로 내보낸다. 단서 단어(아무 단어)와 4,650개 후보의 유사도를 브라우저에서 직접 계산하기 위함.

생성 (web_data/komantle-data/):
  cand.bin        후보 4650 x 300 float16 리틀엔디언 (정규화됨). 어휘에 없는 후보는 0벡터.
  vec/{k}.json    shard k의 단어 목록 ["단어", ...]
  vec/{k}.bin     같은 순서의 벡터 (단어수 x 300 float16, 정규화됨)
shard k = FNV-1a(단어) % 512  (web/solver.js의 hashWord와 동일)

실행: solver.py와 같은 폴더에서  python export_vectors.py
"""

import json
import pickle
from pathlib import Path

import numpy as np

DATA_DIR = Path(__file__).parent / "data"

OUT = Path(__file__).parent / "web_data" / "komantle-data"
SHARDS = 512
DIMS = 300


def hash_word(word: str) -> int:
    h = 0x811C9DC5
    for ch in word:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h % SHARDS


def main():
    with open(DATA_DIR / "valid_nearest.pkl", "rb") as f:
        words, vecs = pickle.load(f)
    words = list(words)
    vecs = np.asarray(vecs, dtype=np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    vecs = np.divide(vecs, norms, out=np.zeros_like(vecs), where=norms > 0)
    assert vecs.shape[1] == DIMS

    index = np.load(Path(__file__).parent / "data" / "komantle_index.npz")
    secrets = index["secrets"].tolist()
    word2idx = {w: i for i, w in enumerate(words)}

    # 후보 벡터
    cand = np.zeros((len(secrets), DIMS), dtype=np.float32)
    missing = 0
    for i, s in enumerate(secrets):
        j = word2idx.get(s)
        if j is None:
            missing += 1
        else:
            cand[i] = vecs[j]
    OUT.mkdir(parents=True, exist_ok=True)
    cand.astype("<f2").tofile(OUT / "cand.bin")

    # 어휘 shard
    vec_dir = OUT / "vec"
    vec_dir.mkdir(exist_ok=True)
    for old in vec_dir.iterdir():
        old.unlink()
    buckets = [[] for _ in range(SHARDS)]
    for j, w in enumerate(words):
        buckets[hash_word(w)].append(j)
    max_bytes = 0
    for k, rows in enumerate(buckets):
        with open(vec_dir / f"{k}.json", "w", encoding="utf-8") as f:
            json.dump([words[j] for j in rows], f, ensure_ascii=False, separators=(",", ":"))
        data = vecs[rows].astype("<f2") if rows else np.zeros((0, DIMS), dtype="<f2")
        data.tofile(vec_dir / f"{k}.bin")
        max_bytes = max(max_bytes, data.nbytes)

    print(f"어휘 {len(words):,}개, 후보 {len(secrets):,}개 (어휘에 없는 후보 {missing}개)")
    print(f"cand.bin {cand.nbytes // 2 / 1e6:.1f} MB, vec shard {SHARDS}개, 최대 {max_bytes / 1024:.0f} KB")


if __name__ == "__main__":
    main()
