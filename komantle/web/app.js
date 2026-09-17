import { matchFingerprint, parseKomantleText, hints, findNeighbor, loadFingerprint, loadNeighbors } from "./solver.js";

const $ = (id) => document.getElementById(id);
const STORE_KEY = "komantle-solver";

// ---- 상태 ----
let state = { top: null, top10: null, rest: null, round: null, index: null, history: [] };
let data = null; // { a: 정답, n: 이웃 }
let revealed = false;

function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} }
function load() { try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s) state = { ...state, ...s }; } catch {} }

function setMsg(el, text, ok = false) { el.textContent = text; el.classList.toggle("ok", ok); }
function fmt(n) { return Number(n).toFixed(2); }

// ---- 1. 세 숫자 입력 ----
$("paste").addEventListener("input", (e) => {
  const p = parseKomantleText(e.target.value);
  if (!p) return;
  $("top").value = p.top;
  $("top10").value = p.top10;
  $("rest").value = p.rest ?? "";
  $("round").textContent = p.round ? `${p.round}번째 꼬맨틀` : "";
  state.round = p.round;
});

$("find-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const top = Number($("top").value);
  const top10 = Number($("top10").value);
  const rest = $("rest").value === "" ? null : Number($("rest").value);
  $("find-btn").disabled = true;
  setMsg($("find-msg"), "찾는 중…");
  $("candidates").innerHTML = "";
  try {
    const fp = await loadFingerprint();
    const r = matchFingerprint(fp, top, top10, rest);
    // 다른 세 숫자면 기록 초기화
    if (state.top !== top || state.top10 !== top10 || state.rest !== rest) {
      state = { ...state, top, top10, rest, index: null, history: [] };
    }
    if (r.approx) setMsg($("find-msg"), "정확히 일치하지 않음. 입력값을 확인하세요. (가장 가까운 후보를 보여줍니다)");
    else if (r.candidates.length > 1) setMsg($("find-msg"), `후보가 ${r.candidates.length}개입니다. 하나를 고르세요.`);
    else setMsg($("find-msg"), "정답을 찾았습니다.", true);

    if (r.candidates.length > 1) {
      r.candidates.forEach((i, k) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = `후보 ${k + 1}`;
        b.onclick = () => selectCandidate(i);
        $("candidates").appendChild(b);
      });
    } else {
      await selectCandidate(r.candidates[0]);
    }
  } catch (err) {
    setMsg($("find-msg"), `오류: ${err.message}`);
  } finally {
    $("find-btn").disabled = false;
  }
});

async function selectCandidate(index) {
  if (state.index !== index) { state.index = index; state.history = []; }
  data = await loadNeighbors(index);
  revealed = false;
  $("answer").hidden = true;
  $("answer").textContent = "";
  $("sec-answer").hidden = false;
  $("sec-hint").hidden = false;
  save();
  renderHistory();
  $("word").focus();
}

// ---- 2. 정답 보기 ----
$("reveal-btn").addEventListener("click", () => {
  if (!data) return;
  if (!revealed && !confirm("스포일러입니다. 정답을 보시겠어요?")) return;
  revealed = true;
  $("answer").textContent = data.a;
  $("answer").hidden = false;
  renderHistory();
});

// ---- 3. 힌트 받기 ----
function updateSimField() {
  const w = $("word").value.trim();
  const known = !w || !data || w === data.a || findNeighbor(data.n, w);
  $("sim-wrap").hidden = !!known;
  $("sim-help").hidden = !!known;
}
$("word").addEventListener("input", updateSimField);

$("hint-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!data) return;
  const word = $("word").value.trim();
  if (!word) return;
  const step = Number(new FormData(e.target).get("step"));
  $("hints").innerHTML = "";
  $("my-word").textContent = "";

  if (word === data.a) {
    setMsg($("hint-msg"), "정답!", true);
    pushHistory({ word, sim: 100, rank: 0 });
    $("word").value = "";
    return;
  }
  const found = findNeighbor(data.n, word);
  let sim;
  let rankText;
  if (found) {
    sim = found.sim;
    rankText = `약 ${found.rank}위`;
  } else {
    if ($("sim").value === "") {
      $("sim-wrap").hidden = false;
      $("sim-help").hidden = false;
      $("sim").focus();
      return;
    }
    sim = Number($("sim").value);
    rankText = "1,000위 밖";
  }
  pushHistory({ word, sim, rank: found ? found.rank : null });
  $("my-word").textContent = `${word}: 유사도 ${fmt(sim)} (${rankText})`;

  if (sim >= data.n[0][1]) {
    setMsg($("hint-msg"), "거의 다 왔어요! 1위 이웃 이상입니다.", true);
  } else {
    const exclude = new Set(state.history.map((h) => h.word));
    // 결과 표시 직전에 정답을 한 번 더 걸러낸다
    const list = hints(data.n, sim, step, 5, exclude, data.a).filter((h) => h.word !== data.a);
    setMsg($("hint-msg"), list.length ? "" : "더 보여줄 힌트가 없습니다.");
    for (const h of list) {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = h.word;
      const small = document.createElement("small");
      small.textContent = `${fmt(h.sim)} · 약 ${h.rank}위`;
      b.appendChild(small);
      b.onclick = () => { $("word").value = h.word; updateSimField(); $("word").focus(); };
      li.appendChild(b);
      $("hints").appendChild(li);
    }
  }
  $("word").value = "";
  $("sim").value = "";
  updateSimField();
});

function pushHistory(entry) {
  state.history = state.history.filter((h) => h.word !== entry.word);
  state.history.push(entry);
  state.history.sort((a, b) => b.sim - a.sim);
  save();
  renderHistory();
}

function renderHistory() {
  const tb = $("history").querySelector("tbody");
  tb.innerHTML = "";
  for (const h of state.history) {
    const tr = document.createElement("tr");
    const isAns = h.rank === 0;
    if (isAns) tr.className = "answer-row";
    const cells = [
      isAns && !revealed ? "정답 (가려짐)" : h.word,
      isAns ? "정답" : fmt(h.sim),
      isAns ? "-" : h.rank ? `약 ${h.rank}위` : "1,000위 밖",
    ];
    for (const c of cells) {
      const td = document.createElement("td");
      td.textContent = c;
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  }
}

$("clear-btn").addEventListener("click", () => {
  state.history = [];
  save();
  renderHistory();
  $("hints").innerHTML = "";
  $("my-word").textContent = "";
  setMsg($("hint-msg"), "");
});

// ---- 시작: 저장된 상태 복원 ----
load();
if (state.top != null) {
  $("top").value = state.top;
  $("top10").value = state.top10;
  $("rest").value = state.rest ?? "";
  if (state.round) $("round").textContent = `${state.round}번째 꼬맨틀`;
  if (state.index != null) {
    loadNeighbors(state.index)
      .then((d) => { data = d; $("sec-answer").hidden = false; $("sec-hint").hidden = false; renderHistory(); })
      .catch(() => {});
  }
}
