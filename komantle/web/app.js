import { resolve, parseKomantleText, hints, findNeighbor, loadFingerprint, loadNeighbors, loadCandidateVectors, lookupVector, simsToCandidates } from "./solver.js";

const $ = (id) => document.getElementById(id);
const STORE_KEY = "komantle-solver";

// ---- 상태 ----
// confirmed: 정답이 확정됐는가. 세 숫자가 정확히 일치했거나, 단서로 후보가 1개로 좁혀졌거나, 사용자가 후보를 직접 골랐을 때 true.
const EMPTY = { top: null, top10: null, rest: null, round: null, index: null, confirmed: false, history: [], clues: [] };
let state = { ...EMPTY };
let data = null; // { a: 정답, n: 이웃 }
let revealed = false;

function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} }
function load() { try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s) state = { ...EMPTY, ...s }; } catch {} }

function setMsg(el, text, ok = false) { el.textContent = text; el.classList.toggle("ok", ok); }
function fmt(n) { return Number(n).toFixed(2); }

// ---- 확정 상태에 따른 화면 ----
function renderStatus() {
  const has = state.index != null;
  $("sec-answer").hidden = !has;
  $("sec-hint").hidden = !has;
  if (!has) return;
  const badge = $("status");
  badge.textContent = state.confirmed ? "정답 확정" : "정답 미확정";
  badge.className = state.confirmed ? "badge ok" : "badge warn";
  $("reveal-btn").disabled = !state.confirmed;
  $("answer-help").textContent = state.confirmed
    ? "스포일러입니다. 버튼을 눌러야 보입니다."
    : "세 숫자가 사이트와 정확히 맞지 않아 정답을 확정할 수 없습니다. 아래 힌트 받기에 꼬맨틀에 친 단어와 유사도를 2개 넣으면 확정됩니다.";
  $("hint-help").textContent = state.confirmed
    ? "꼬맨틀에 입력한 단어를 적으면, 그보다 조금 더 유사한 단어를 알려줍니다."
    : "정답이 미확정이라 힌트는 아직 나오지 않습니다. 꼬맨틀에 친 단어와 그때 나온 유사도를 넣어 주세요. 넣는 단어마다 자동으로 단서로 쓰여 정답을 좁힙니다.";
  updateSimField();
}

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
  return row;
}
const isValidSim = (v) => typeof v === "number" && !Number.isNaN(v) && v !== 0;
function readClues() {
  return [...$("clue-rows").querySelectorAll(".row")]
    .map((r) => ({ word: r.querySelector(".clue-word").value.trim(), sim: Number(r.querySelector(".clue-sim").value) }))
    .filter((c) => c.word && isValidSim(c.sim));
}
/** 단서를 추가한다(같은 단어가 있으면 유사도만 갱신). 빈 행이 있으면 거기에 채운다. */
function upsertClue(word, sim) {
  const rows = [...$("clue-rows").querySelectorAll(".row")];
  const same = rows.find((r) => r.querySelector(".clue-word").value.trim() === word);
  if (same) { same.querySelector(".clue-sim").value = sim; return; }
  const empty = rows.find((r) => !r.querySelector(".clue-word").value.trim());
  if (empty) { empty.querySelector(".clue-word").value = word; empty.querySelector(".clue-sim").value = sim; return; }
  addClueRow(word, sim);
}
$("clue-add").addEventListener("click", () => addClueRow());

// ---- 찾기 ----
async function find() {
  const top = Number($("top").value);
  const top10 = Number($("top10").value);
  const rest = $("rest").value === "" ? null : Number($("rest").value);
  if (!top || !top10) { setMsg($("find-msg"), "1위와 10위 유사도를 입력하세요."); return; }
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
      state = { ...state, top, top10, rest, index: null, confirmed: false, history: [] };
    }
    state.clues = clues;

    const single = r.candidates.length === 1;
    const confirmed = single && !r.approx; // 지문 정확 일치 또는 단서로 1개 특정
    if (r.byClue && single) setMsg($("find-msg"), "단어 단서로 정답을 확정했습니다.", true);
    else if (r.byClue) setMsg($("find-msg"), `단서에 맞는 후보가 ${r.candidates.length}개입니다. 단어를 하나 더 넣으면 확정됩니다. (후보 1이 가장 유력)`);
    else if (r.clueMiss) setMsg($("find-msg"), missing.length
      ? `꼬맨틀 어휘에 없는 단어입니다: ${missing.join(", ")}. 꼬맨틀에 친 그대로 입력했는지 확인하세요.`
      : "단서에 맞는 후보가 없습니다. 유사도를 꼬맨틀에 나온 숫자 그대로 넣었는지 확인하세요.");
    else if (r.approx) setMsg($("find-msg"), "세 숫자가 사이트와 정확히 맞지 않습니다(어휘 차이 때문에 종종 생깁니다). 아래 힌트 받기에 꼬맨틀에 친 단어와 유사도를 2개 넣으면 정답이 확정됩니다.");
    else if (!single) setMsg($("find-msg"), `후보가 ${r.candidates.length}개입니다. 하나를 고르세요.`);
    else setMsg($("find-msg"), "정답을 찾았습니다.", true);

    if (!single) {
      r.candidates.forEach((i, k) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = `후보 ${k + 1}`;
        b.onclick = () => selectCandidate(i, true);
        $("candidates").appendChild(b);
      });
    }
    await selectCandidate(r.candidates[0], confirmed);
    if (!confirmed) { $("clue-box").open = true; $("word").focus(); }
  } catch (err) {
    setMsg($("find-msg"), `오류: ${err.message}`);
  } finally {
    $("find-btn").disabled = false;
  }
}
$("find-form").addEventListener("submit", (e) => { e.preventDefault(); find(); });

async function selectCandidate(index, confirmed) {
  if (state.index !== index) { state.index = index; state.history = state.history.filter((h) => h.fromSite); }
  state.confirmed = confirmed;
  data = await loadNeighbors(index);
  revealed = false;
  $("answer").hidden = true;
  $("answer").textContent = "";
  save();
  renderStatus();
  renderHistory();
}

// ---- 2. 정답 보기 ----
$("reveal-btn").addEventListener("click", () => {
  if (!data || !state.confirmed) return;
  if (!revealed && !confirm("스포일러입니다. 정답을 보시겠어요?")) return;
  revealed = true;
  $("answer").textContent = data.a;
  $("answer").hidden = false;
  renderHistory();
});

// ---- 3. 힌트 받기 ----
function updateSimField() {
  const w = $("word").value.trim();
  // 미확정이면 항상 사이트 유사도를 받는다(그 값이 단서가 된다). 확정이면 이웃 목록에 없는 단어만 받는다.
  const need = !state.confirmed || (w && data && w !== data.a && !findNeighbor(data.n, w));
  $("sim-wrap").hidden = !need;
  $("sim-help").hidden = !need;
  $("sim-help").textContent = state.confirmed
    ? "이웃 목록에 없는 단어입니다. 꼬맨틀에 나온 유사도를 입력해주세요."
    : "꼬맨틀에 나온 유사도를 그대로 입력해주세요. 정답을 확정하는 단서로 쓰입니다.";
}
$("word").addEventListener("input", updateSimField);

$("hint-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!data) return;
  const word = $("word").value.trim();
  if (!word) return;
  const step = Number(new FormData(e.target).get("step"));
  $("hints").innerHTML = "";
  $("my-word").textContent = "";

  // 미확정: 단어 + 사이트 유사도를 단서로 추가하고 다시 찾는다
  if (!state.confirmed) {
    if ($("sim").value === "") { updateSimField(); $("sim").focus(); return; }
    const sim = Number($("sim").value);
    upsertClue(word, sim);
    pushHistory({ word, sim, rank: null, fromSite: true });
    $("word").value = ""; $("sim").value = "";
    await find();
    if (state.confirmed) {
      // 확정됐으니 기록의 순위를 채우고 힌트 안내
      state.history = state.history.map((h) => { const f = findNeighbor(data.n, h.word); return f ? { ...h, rank: f.rank } : h; });
      save(); renderHistory();
      setMsg($("hint-msg"), "정답이 확정됐습니다. 이제 단어를 넣으면 힌트가 나옵니다.", true);
    } else {
      setMsg($("hint-msg"), `단서 ${readClues().length}개 반영. 단어를 하나 더 넣어 주세요.`);
    }
    return;
  }

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
    if ($("sim").value === "") { updateSimField(); $("sim").focus(); return; }
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
      isAns ? "-" : h.rank ? `약 ${h.rank}위` : state.confirmed ? "1,000위 밖" : "-",
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
  state = { ...EMPTY };
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
  $("answer").hidden = true; $("answer").textContent = "";
  $("hints").innerHTML = ""; $("my-word").textContent = ""; setMsg($("hint-msg"), "");
  $("word").value = ""; $("sim").value = "";
  renderStatus();
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
      .then((d) => { data = d; renderStatus(); renderHistory(); })
      .catch(() => {});
  }
}
while ($("clue-rows").children.length < 2) addClueRow();
