"""
꼬맨틀 솔버: 사이트의 세 숫자로 정답 찾기 + 추측 단어 기반 힌트

먼저 precompute.py를 한 번 실행해서 komantle_index.npz를 만들어야 한다.
실행: python solver.py
"""

import pickle
from pathlib import Path

import numpy as np

DATA_DIR = Path(__file__).parent / "data"


class KomantleSolver:
    def __init__(self, data_dir: Path = DATA_DIR):
        with open(data_dir / "valid_nearest.pkl", "rb") as f:
            words, vecs = pickle.load(f)
        self.words = list(words)
        vecs = np.asarray(vecs, dtype=np.float32)
        norms = np.linalg.norm(vecs, axis=1, keepdims=True)
        self.vecs = np.divide(vecs, norms, out=np.zeros_like(vecs), where=norms > 0)
        self.word2idx = {w: i for i, w in enumerate(self.words)}

        index = np.load(data_dir / "komantle_index.npz")
        self.secrets = index["secrets"].tolist()
        self.fp = index["fp"]          # (후보수, 3): 1위, 10위, 1000위 유사도 x100
        self.nb_idx = index["nb_idx"]  # (후보수, 1000): 이웃 단어 인덱스
        self.nb_sim = index["nb_sim"]  # (후보수, 1000): 이웃 유사도 (0~1)
        self.sec_vocab = np.array([self.word2idx.get(s, -1) for s in self.secrets])
        self.reset()

    # ---------- 게임 상태 ----------
    def reset(self):
        """새 게임 시작: 어휘에 있는 모든 후보로 초기화."""
        self.candidates = np.where(self.sec_vocab >= 0)[0]

    # ---------- 1. 세 숫자로 한방에 찾기 ----------
    def solve_by_stats(self, top: float, top10: float, rest: float, tol: float = 0.006):
        """
        1위·10위: 사이트와 거의 정확히 일치해야 함
        1000위: 사이트 어휘가 더 커서 사이트 값이 같거나 높게 나옴 -> 한쪽 방향만 검사
        일치하는 게 없으면 가장 가까운 후보 5개를 반환
        """
        fp = self.fp[self.candidates]
        strict = np.all(np.abs(fp[:, :2] - [top, top10]) <= tol, axis=1)
        rest_ok = rest >= fp[:, 2] - tol
        mask = strict & rest_ok

        if mask.any():
            self.candidates = self.candidates[mask]
            self.approx = False
        else:
            dist = np.abs(fp[:, :2] - [top, top10]).max(axis=1)
            self.candidates = self.candidates[np.argsort(dist)[:5]]
            self.approx = True
        return [self.secrets[i] for i in self.candidates]

    # ---------- 2. 후보가 여러 개일 때 추측으로 좁히기 ----------
    def narrow_by_guess(self, word: str, site_sim: float, tol: float = 0.01):
        wi = self.word2idx.get(word)
        if wi is None:
            raise KeyError(word)
        cand = self.candidates
        sims = self.vecs[self.sec_vocab[cand]] @ self.vecs[wi] * 100
        self.candidates = cand[np.abs(sims - site_sim) <= tol]
        return [self.secrets[i] for i in self.candidates]

    # ---------- 3. 정답이 정해진 뒤: 유사도, 순위, 힌트 ----------
    def similarity(self, secret_i: int, word: str):
        wi = self.word2idx.get(word)
        if wi is None:
            return None
        return float(self.vecs[self.sec_vocab[secret_i]] @ self.vecs[wi] * 100)

    def rank(self, secret_i: int, word: str):
        """상위 1000 안이면 순위(1부터), 아니면 None."""
        wi = self.word2idx.get(word)
        if wi is None:
            return None
        hit = np.where(self.nb_idx[secret_i] == wi)[0]
        return int(hit[0]) + 1 if hit.size else None

    def hints(self, secret_i: int, guess_sim: float, step: float = 3.0, n: int = 5, exclude=()):
        """내 유사도보다 약 step점 높은 단어 n개를 (단어, 유사도, 순위)로 반환."""
        sims = self.nb_sim[secret_i] * 100
        target = guess_sim + step
        out = []
        for j in np.argsort(np.abs(sims - target)):
            word = self.words[self.nb_idx[secret_i][j]]
            if sims[j] <= guess_sim or word in exclude:
                continue
            out.append((word, float(sims[j]), int(j) + 1))
            if len(out) == n:
                break
        return sorted(out, key=lambda x: -x[1])


# ---------------- 데모 CLI ----------------
def ask_float(prompt: str) -> float:
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("숫자로 입력해주세요.")


def main():
    solver = KomantleSolver()

    print("사이트 상단의 세 숫자를 입력하세요.")
    top = ask_float("가장 유사한 단어의 유사도: ")
    top10 = ask_float("10번째로 유사한 단어의 유사도: ")
    rest = ask_float("1,000번째로 유사한 단어의 유사도: ")

    cands = solver.solve_by_stats(top, top10, rest)
    if solver.approx:
        print(f"\n정확히 일치하는 후보가 없어 가장 가까운 후보 {len(cands)}개를 보여줍니다: {cands}")
    elif len(cands) == 1:
        print(f"\n한방 정답: {cands[0]}")
    else:
        print(f"\n후보 {len(cands)}개: {cands}")

    guessed = set()
    print("\n힌트 모드 (엔터만 누르면 종료)")
    while True:
        word = input("\n추측 단어: ").strip()
        if not word:
            break
        if word not in solver.word2idx:
            print("사전에 없는 단어입니다.")
            continue
        guessed.add(word)

        if len(solver.candidates) > 1:
            site_sim = ask_float("사이트에 나온 유사도: ")
            cands = solver.narrow_by_guess(word, site_sim)
            print(f"남은 후보 {len(cands)}개: {cands[:10]}")
            if len(solver.candidates) != 1:
                if not cands:
                    print("후보가 모두 사라졌습니다. 오차(tol)를 늘려보세요.")
                    break
                continue

        i = int(solver.candidates[0])
        sim = solver.similarity(i, word)
        rank = solver.rank(i, word)
        rank_text = f"{rank}위" if rank else "1000위 밖"
        print(f"'{word}' 유사도 {sim:.2f} ({rank_text})")

        if sim >= 99.99:
            print("정답입니다!")
            break
        hints = solver.hints(i, sim, exclude=guessed)
        if not hints:
            print("이미 1위권입니다. 거의 다 왔어요!")
        else:
            print("더 가까운 단어 힌트:")
            for w, s, r in hints:
                print(f"  {w:<10} {s:6.2f}  ({r}위)")


if __name__ == "__main__":
    main()
