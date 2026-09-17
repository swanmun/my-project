"""
komantle_index.npz -> 정적 웹사이트용 데이터 생성

생성 폴더: web_data/komantle-data/
  fp.bin        Float32 리틀엔디언, 4650 x 3 (1위, 10위, 1000위 유사도 x100)
  n/{i}.json    후보 i의 이웃 1,000개: {"a": 정답단어, "n": [[단어, 유사도x100], ...]}
                (유사도 내림차순, 배열 인덱스+1 = 로컬 순위, 정답 자신은 제외)
  meta.json     상수 정보

이 폴더를 통째로 웹사이트의 정적 파일 폴더에 복사하면 된다.
실행: solver.py와 같은 폴더에서  python export_web_data.py
"""

import json
import pickle
import shutil
from pathlib import Path

import numpy as np

from solver import DATA_DIR

OUT = Path(__file__).parent / "web_data" / "komantle-data"
CHECK_DAY = 1630
CHECK_STATS = (52.97, 45.92, 29.64)
TOL = 0.006


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "n").mkdir(parents=True)

    with open(DATA_DIR / "valid_nearest.pkl", "rb") as f:
        words, _ = pickle.load(f)
    words = list(words)

    index = np.load(DATA_DIR / "komantle_index.npz")
    secrets = index["secrets"].tolist()
    fp = index["fp"].astype("<f4")
    nb_idx = index["nb_idx"]
    nb_sim = index["nb_sim"]
    n = len(secrets)

    if np.isnan(fp).any() or (nb_idx < 0).any():
        raise SystemExit("인덱스에 NaN 또는 빈 이웃이 있습니다. precompute.py를 다시 실행하세요.")

    # 1) 지문
    fp.tofile(OUT / "fp.bin")

    # 2) 후보별 이웃 파일
    sizes = []
    for i in range(n):
        rec = {
            "a": secrets[i],
            "n": [[words[j], round(float(s) * 100, 2)] for j, s in zip(nb_idx[i], nb_sim[i])],
        }
        data = json.dumps(rec, ensure_ascii=False, separators=(",", ":"))
        (OUT / "n" / f"{i}.json").write_text(data, encoding="utf-8")
        sizes.append(len(data.encode("utf-8")))

    # 3) 메타
    meta = {
        "num_secrets": n,
        "neighbors_per_file": int(nb_idx.shape[1]),
        "fp_tol": TOL,
        "note": "1000위 값은 사이트가 같거나 높게 나오므로 rest >= fp[2] - tol 로만 비교",
    }
    (OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    # 4) 검증 (정답 단어는 출력하지 않음)
    fp_back = np.fromfile(OUT / "fp.bin", dtype="<f4").reshape(n, 3)
    top, top10, rest = CHECK_STATS
    strict = np.all(np.abs(fp_back[:, :2] - [top, top10]) <= TOL, axis=1)
    rest_ok = rest >= fp_back[:, 2] - TOL
    matched = np.where(strict & rest_ok)[0].tolist()
    rec = json.loads((OUT / "n" / f"{CHECK_DAY}.json").read_text(encoding="utf-8"))

    total_mb = (sum(sizes) + (OUT / "fp.bin").stat().st_size) / 1024 / 1024
    print("=== 생성 완료 ===")
    print(f"폴더: {OUT}")
    print(f"파일 수: {n + 2}개 (이웃 파일 {n} + fp.bin + meta.json)")
    print(f"전체 크기: {total_mb:.1f} MB, 이웃 파일 평균 {np.mean(sizes) / 1024:.1f} KB, 최대 {max(sizes) / 1024:.1f} KB")
    print("\n=== 검증 ===")
    print(f"지문 대조 결과: {matched}  ([{CHECK_DAY}]이어야 함)")
    print(f"{CHECK_DAY}.json 이웃 수: {len(rec['n'])}  (1000이어야 함)")
    print(f"1위 이웃 유사도 {rec['n'][0][1]} == 지문 {fp_back[CHECK_DAY, 0]:.2f}")
    print(f"정답 == secrets[{CHECK_DAY}]: {rec['a'] == secrets[CHECK_DAY]}  (True여야 함)")
    print(f"이웃 목록에 정답 포함: {any(w == rec['a'] for w, _ in rec['n'])}  (False여야 함)")


if __name__ == "__main__":
    main()
