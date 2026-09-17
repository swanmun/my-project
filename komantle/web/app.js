import { resolve, parseKomantleText, hints, findNeighbor, loadFingerprint, loadNeighbors, loadCandidateVectors, lookupVector, simsToCandidates } from "./solver.js";

const $ = (id) => document.getElementById(id);
const STORE_KEY = "komantle-solver";

// ---- 상태 ----
let state = { top: null, top10: null, rest: null, round: null, index: null, history: [], clues: [] };
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
  // 다른 회차 문장을 붙여넣으면 이전 회차의 단서·기록을 자동으로 비운다
  if (p.round && state.round && p.round !== state.round) {
    const keep = e.target.value;
    resetAll();
    $("paste").value = keep;
  }
  $("top").value = p.top;
  $("top10").value = p.top10;
  $("rest").value = p.rest ?? "";
  $("round").textContent = p.round ? `${p.round}번째 꼬맨틀` : "";
  state.round = p.round;
});

// ---- 단어 단서 입력 행 ----
function addClueRow(word = "", sim = "") {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<label>단어 <input type="text" class="clue-word" autocomplete="off" /></label>
    <label>유사도 <input type="number" class="clue-sim" step="0.01" inputmode="decimal" /></label>
    <button type="button" class="link clue-del">삭제</button>`;
  row.querySelector(".clue-word").value = word;
  row.querySelector(".clue-sim").value = sim;
  row.querySelector(".clue-del").onclick = () => row.remove();
  $("clue-rows").appendChild(row);
}
function readClues() {
  return [...$("clue-rows").querySelectorAll(".row")]
    .map((r) => ({ word: r.querySelector(".clue-word").value.trim(), sim: Number(r.querySelector(".clue-sim").value) }))
    .filter((c) => c.word && isValidSim(c.sim));
}
const isValidSim = (v) => typeof v === "number" && !Number.isNaN(v) && v !== 0;
$("clue-add").addEventListener("click", () => addClueRow());

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
    const clues = readClues();
    let clueSims = [];
    if (clues.length) {
      const [cand, vecs] = await Promise.all([loadCandidateVectors(), Promise.all(clues.map((c) => lookupVector(c.word)))]);
      clueSims = vecs.map((v) => (v ? simsToCandidates(cand, v) : null));
    }
    const missing = clues.filter((_, k) => clueSims[k] === null).map((c) => c.word);
    const r = resolve(fp, top, top10, rest, clues, clueSims);
    // 다른 세 숫자면 기록 초기화
    if (state.top !== top || state.top10 !== top10 || state.rest !== rest) {
      state = { ...state, top, top10, rest, index: null, history: [] };
    }
    state.clues = clues;
    if (r.byClue && r.candidates.length === 1) setMsg($("find-msg"), "단어 단서로 정답을 찾았습니다.", true);
    else if (r.byClue) { setMsg($("find-msg"), `단서에 맞는 후보가 ${r.candidates.length}개입니다. 단서를 하나 더 넣고 다시 찾으면 특정됩니다. (후보 1이 가장 유력)`); if (readClues().length >= $("clue-rows").children.length) addClueRow(); }
    else if (r.clueMiss) {
      setMsg($("find-msg"), missing.length
        ? `꼬맨틀 어휘에 없는 단어입니다: ${missing.join(", ")}. 꼬맨틀에 친 그대로 입력했는지 확인하세요. (세 숫자로 가장 가까운 후보를 보여줍니다)`
        : "단서에 맞는 후보가 없습니다. 유사도를 꼬맨틀에 나온 숫자 그대로 넣었는지 확인하세요. (세 숫자로 가장 가까운 후보를 보여줍니다)");
      $("clue-box").open = true;
    } else if (r.approx) {
      setMsg($("find-msg"), "세 숫자가 정확히 일치하지 않습니다. 꼬맨틀에 친 단어와 유사도를 '단어 단서'에 넣고 다시 찾아보세요. (지금은 가장 가까운 후보를 보여줍니다)");
      $("clue-box").open = true;
    } else if (r.candidates.length > 1) setMsg($("find-msg"), `후보가 ${r.candidates.length}개입니다. 하나를 고르세요.`);
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

// ---- 전체 초기화: 세 숫자·단서·기록 모두 삭제 ----
function resetAll() {
  state = { top: null, top10: null, rest: null, round: null, index: null, history: [], clues: [] };
  data = null;
  revealed = false;
  try { localStorage.removeItem(STORE_KEY); } catch {}
  $("paste").value = "";
  $("top").value = ""; $("top10").value = ""; $("rest").value = "";
  $("round").textContent = "";
  setMsg($("find-msg"), "");
  $("candidates").innerHTML = "";
  $("clue-rows").innerHTML = "";
  while ($("clue-rows").children.length < 2) addClueRow();
  $("clue-box").open = false;
  $("sec-answer").hidden = true;
  $("sec-hint").hidden = true;
  $("answer").hidden = true; $("answer").textContent = "";
  $("hints").innerHTML = ""; $("my-word").textContent = ""; setMsg($("hint-msg"), "");
  $("word").value = ""; $("sim").value = "";
  renderHistory();
  $("paste").focus();
}
$("reset-btn").addEventListener("click", () => {
  if (confirm("세 숫자, 단서, 입력 기록을 모두 지우고 처음부터 시작할까요?")) resetAll();
});

// ---- 시작: 저장된 상태 복원 ----
load();
if (state.top != null) {
  $("top").value = state.top;
  $("top10").value = state.top10;
  $("rest").value = state.rest ?? "";
  if (state.round) $("round").textContent = `${state.round}번째 꼬맨틀`;
  for (const c of state.clues ?? []) addClueRow(c.word, c.sim);
  if (state.clues?.length) $("clue-box").open = true;
  if (state.index != null) {
    loadNeighbors(state.index)
      .then((d) => { data = d; $("sec-answer").hidden = false; $("sec-hint").hidden = false; renderHistory(); })
      .catch(() => {});
  }
}
while ($("clue-rows").children.length < 2) addClueRow();
