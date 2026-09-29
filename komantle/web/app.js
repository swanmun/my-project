import { resolve, parseKomantleText, hints, findNeighbor, loadFingerprint, loadNeighbors, loadCandidateVectors, lookupVector, simsToCandidates } from "./solver.js";

const $ = (id) => document.getElementById(id);
const STORE_KEY = "komantle-solver";

// ---- 상태 ----
// confirmed: 정답이 확정됐는가. 세 숫자가 정확히 일치했거나, 단서로 후보가 1개로 좁혀졌거나, 사용자가 후보를 직접 골랐을 때 true.
const EMPTY = { top: null, top10: null, rest: null, round: null, index: null, confirmed: false, history: [], clues: [], marks: [] };
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
    ? "꼬맨틀에 입력한 단어를 적으면, 그보다 순위가 높은 단어를 알려줍니다. 정답은 절대 나오지 않습니다."
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
  setMsg($("paste-msg"), p.round ? `${p.round}번째 회차 인식됨 · 바로 찾습니다.` : "세 숫자 인식됨 · 바로 찾습니다.", true);
  // 문장을 붙여넣으면 버튼을 누르지 않아도 바로 찾는다
  clearTimeout(autoFindTimer);
  autoFindTimer = setTimeout(find, 150);
});
let autoFindTimer = null;

// 붙여넣기 버튼: 클립보드를 읽어 칸에 넣는다 (브라우저가 한 번 허용을 묻는다)
$("paste-btn").addEventListener("click", async () => {
  let text = "";
  try {
    text = await navigator.clipboard.readText();
  } catch {
    setMsg($("paste-msg"), "클립보드를 읽을 수 없습니다. 칸을 누르고 직접 붙여넣어 주세요.");
    $("paste").focus();
    return;
  }
  if (!parseKomantleText(text)) {
    setMsg($("paste-msg"), "복사된 내용에 유사도 숫자가 없습니다. 꼬맨틀 맨 위 문장을 먼저 복사하세요.");
    return;
  }
  $("paste").value = text;
  $("paste").dispatchEvent(new Event("input", { bubbles: true }));
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
$("word").addEventListener("input", () => { updateSimField(); updateStepLabels(); });
document.querySelectorAll('input[name="step"]').forEach((r) => r.addEventListener("change", updateStepLabels));

// 순위 ↔ 막대 위치. 1,000위가 왼쪽 0, 1위가 오른쪽 1000. 로그 눈금이라 정답 근처가 넓게 보인다.
const rankPos = (rank) => Math.max(0, Math.min(1000, 1000 * (1 - Math.log10(Math.max(1, rank)) / 3)));
const posRank = (pos) => Math.max(1, Math.round(10 ** (3 * (1 - pos / 1000))));

const DEFAULT_F = 0.5;  // 목표 순위 기본값: 내 순위의 절반
let targetRank = null;  // 슬라이더로 정한 목표 순위. null 이면 기본값으로 계산
let lastHints = [];

function myRankNow() {
  const w = $("word").value.trim();
  if (!w || !state.confirmed || !data) return null;
  const found = findNeighbor(data.n, w);
  return { w, found, rank: found ? found.rank : data.n.length + 1 };
}
// 목표 순위는 항상 1 이상, 내 순위보다 앞이어야 한다
function clampTarget(myRank) {
  const t = targetRank ?? Math.round(myRank * DEFAULT_F);
  return Math.max(1, Math.min(myRank - 1, t));
}

/** 프리셋 버튼 글자, 슬라이더, 미리보기, 막대 위의 점들을 모두 갱신 */
function updateStepLabels() {
  const me = myRankNow();
  $("steps-note").textContent = me
    ? (me.found ? `내 단어 「${me.w}」는 약 ${me.rank}위` : `「${me.w}」는 1,000위 밖이라 1,001위로 계산`)
    : "단어를 넣으면 막대가 나타납니다. 마젠타 손잡이를 끌어 정하세요.";
  $("rankbar").hidden = !me;
  if (!me) return;
  const target = clampTarget(me.rank);
  $("target").min = Math.ceil(rankPos(me.rank - 1));
  $("target").value = rankPos(target);
  $("rankbar-me").style.left = `${rankPos(me.rank) / 10}%`;
  $("rankbar-me-text").textContent = me.found ? `${me.rank}위` : "1,000위 밖";
  $("rankbar-target-text").textContent = `약 ${target}위`;
  const previewSim = data.n[Math.min(target, data.n.length) - 1]?.[1];
  $("rankbar-preview").textContent = previewSim != null ? `(유사도 약 ${previewSim.toFixed(1)})` : "";
  renderMarks();
}

/** 막대 위 점: 받은 힌트(마젠타 작은 점), 입력한 단어(흰 점) */
function renderMarks() {
  const box = $("rankbar-marks");
  box.innerHTML = "";
  for (const m of state.marks) {
    const d = document.createElement("i"); d.className = "mark hint"; d.style.left = `${rankPos(m.rank) / 10}%`; d.title = `${m.word} · 약 ${m.rank}위`; box.appendChild(d);
  }
  for (const h of state.history) {
    if (!h.rank) continue;
    const d = document.createElement("i"); d.className = "mark word"; d.style.left = `${rankPos(h.rank) / 10}%`; d.title = `${h.word} · 약 ${h.rank}위`; box.appendChild(d);
  }
}

// 슬라이더: 자유 조절
$("target").addEventListener("input", () => {
  const me = myRankNow();
  if (!me) return;
  targetRank = Math.max(1, Math.min(me.rank - 1, posRank(Number($("target").value))));
  updateStepLabels();
});

// 개수: 칩을 누르면 칸에 들어가고, 칸에 직접 적으면 칩 선택이 풀린다
function readCount() { return Math.max(1, Math.min(30, Number($("count").value) || 5)); }
document.querySelectorAll(".count-chip").forEach((btn) => btn.addEventListener("click", () => {
  $("count").value = btn.dataset.n;
  document.querySelectorAll(".count-chip").forEach((b) => b.classList.toggle("is-on", b === btn));
}));
$("count").addEventListener("input", () => {
  document.querySelectorAll(".count-chip").forEach((b) => b.classList.toggle("is-on", b.dataset.n === $("count").value));
});

// 다음 힌트: 방금 받은 힌트 중 가장 가까운 단어를 내 단어로 삼아 같은 설정으로 다시 받는다
$("next-btn").addEventListener("click", () => {
  if (!lastHints.length) return;
  $("word").value = lastHints[0].word;
  updateSimField();
  targetRank = null; // 새 단어 기준으로 기본값(절반)을 다시 적용
  updateStepLabels();
  $("hint-form").requestSubmit();
});

$("hint-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!data) return;
  const word = $("word").value.trim();
  if (!word) return;
  const count = readCount();
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
  const myRank = found ? found.rank : data.n.length + 1;
  pushHistory({ word, sim, rank: found ? found.rank : null });
  $("my-word").textContent = `${word}: 유사도 ${fmt(sim)} (${rankText})`;

  if (sim >= data.n[0][1]) {
    setMsg($("hint-msg"), "거의 다 왔어요! 1위 이웃 이상입니다.", true);
  } else {
    const exclude = new Set(state.history.map((h) => h.word));
    // 슬라이더의 목표 순위를 factor 로 바꿔 넘긴다 (round(myRank * factor) = target)
    const target = clampTarget(myRank);
    const factor = target / myRank;
    // 결과 표시 직전에 정답을 한 번 더 걸러낸다
    const list = hints(data.n, sim, factor, count, exclude, data.a, found ? found.rank : null).filter((h) => h.word !== data.a);
    setMsg($("hint-msg"), list.length ? `약 ${target}위 근처에서 ${list.length}개` : "더 보여줄 힌트가 없습니다.");
    lastHints = list;
    for (const h of list) {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = h.word;
      const small = document.createElement("small");
      small.textContent = `${fmt(h.sim)} · 약 ${h.rank}위`;
      b.appendChild(small);
      b.onclick = () => { $("word").value = h.word; updateSimField(); updateStepLabels(); $("word").focus(); };
      li.appendChild(b);
      $("hints").appendChild(li);
      if (!state.marks.some((m) => m.word === h.word)) state.marks.push({ word: h.word, rank: h.rank });
    }
    save();
    $("next-btn").hidden = list.length === 0;
  }
  $("word").value = "";
  $("sim").value = "";
  updateSimField();
  updateStepLabels();
});

// ---- 순위 구간 보기 ----
// 정답의 이웃 목록(data.n, 순위 오름차순)을 순위 또는 유사도로 잘라 먼 쪽 → 가까운 쪽으로 보여준다.
// 1~10위는 기본 잠금: 단어를 ■■■ 로 가리고 "10위 안 열기"를 눌러야 보인다. 정답은 목록에 없다.
const SPOILER_RANK = 10;
const PAGE = 50;
let browseRows = [];   // 현재 구간의 [rank, word, sim] (먼 쪽부터)
let browseShown = 0;
let browseUnlocked = false;

function browseRange() {
  if (!data || !state.confirmed) { setMsg($("browse-msg"), "정답이 확정된 뒤에 볼 수 있습니다."); return; }
  const mode = $("browse-mode").value;
  let from = Number($("browse-from").value);
  let to = Number($("browse-to").value);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return;
  const n = data.n.length;
  let rows;
  if (mode === "rank") {
    // 순위: 큰 숫자(먼 쪽) → 작은 숫자(가까운 쪽). 순서를 바꿔 넣어도 알아서 정렬
    const hi = Math.min(n, Math.max(from, to)); const lo = Math.max(1, Math.min(from, to));
    rows = [];
    for (let r = hi; r >= lo; r--) rows.push([r, data.n[r - 1][0], data.n[r - 1][1]]);
  } else {
    // 유사도: 낮은 값(먼 쪽) → 높은 값(가까운 쪽)
    const lo = Math.min(from, to); const hi = Math.max(from, to);
    rows = [];
    for (let i = n - 1; i >= 0; i--) { const sim = data.n[i][1]; if (sim >= lo && sim <= hi) rows.push([i + 1, data.n[i][0], sim]); }
  }
  browseRows = rows; browseShown = 0;
  $("browse-list").innerHTML = "";
  const best = state.history.filter((h) => h.rank).reduce((m, h) => Math.min(m, h.rank), Infinity);
  const nearest = rows.length ? Math.min(...rows.map((r) => r[0])) : null;
  let msg = rows.length ? `${rows.length}개` : "해당 구간에 단어가 없습니다.";
  if (rows.length && Number.isFinite(best) && nearest < best) msg += ` · 지금 내 최고 단어는 ${best}위입니다. 그보다 앞 구간이라 스포일러에 가깝습니다.`;
  setMsg($("browse-msg"), msg);
  browseMore();
}

function browseMore() {
  const ol = $("browse-list");
  const mine = new Set(state.history.map((h) => h.word));
  const hinted = new Set(state.marks.map((m) => m.word));
  const slice = browseRows.slice(browseShown, browseShown + PAGE);
  let lockedAny = false;
  for (const [rank, word, sim] of slice) {
    const li = document.createElement("li");
    const locked = rank <= SPOILER_RANK && !browseUnlocked;
    if (locked) lockedAny = true;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "browse-word" + (locked ? " locked" : "");
    b.textContent = locked ? "■■■" : word;
    if (!locked) b.onclick = () => { $("word").value = word; updateSimField(); updateStepLabels(); $("word").focus(); $("word").scrollIntoView({ block: "center" }); };
    const meta = document.createElement("small");
    meta.textContent = `${rank}위 · ${fmt(sim)}`;
    if (mine.has(word)) { const d = document.createElement("i"); d.className = "dot me"; d.title = "입력한 단어"; li.appendChild(d); }
    else if (hinted.has(word)) { const d = document.createElement("i"); d.className = "dot mark"; d.title = "받은 힌트"; li.appendChild(d); }
    li.appendChild(b); li.appendChild(meta);
    ol.appendChild(li);
  }
  browseShown += slice.length;
  $("browse-more").hidden = browseShown >= browseRows.length;
  $("browse-more").textContent = `더 보기 (${browseShown}/${browseRows.length})`;
  const hasLocked = browseRows.some((r) => r[0] <= SPOILER_RANK);
  $("browse-unlock").hidden = !hasLocked || browseUnlocked;
  void lockedAny;
}

$("browse-btn").addEventListener("click", browseRange);
$("browse-more").addEventListener("click", browseMore);
$("browse-unlock").addEventListener("click", () => { browseUnlocked = true; browseRange(); });
$("browse-mode").addEventListener("change", () => {
  const rank = $("browse-mode").value === "rank";
  $("browse-from").value = rank ? 300 : 25;
  $("browse-to").value = rank ? 100 : 30;
  $("browse-from").step = rank ? 1 : 0.01; $("browse-to").step = rank ? 1 : 0.01;
});
document.querySelectorAll(".quick[data-from]").forEach((b) => b.addEventListener("click", () => {
  $("browse-mode").value = "rank"; $("browse-from").value = b.dataset.from; $("browse-to").value = b.dataset.to; browseRange();
}));
$("quick-near").addEventListener("click", () => {
  const me = myRankNow();
  const r = me ? me.rank : state.history.filter((h) => h.rank).reduce((m, h) => Math.min(m, h.rank), NaN);
  if (!r || !Number.isFinite(r)) { setMsg($("browse-msg"), "먼저 단어를 넣어 주세요."); return; }
  $("browse-mode").value = "rank"; $("browse-from").value = Math.min(data.n.length, r + 20); $("browse-to").value = Math.max(1, r - 20); browseRange();
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
  lastHints = []; $("next-btn").hidden = true; targetRank = null;
  browseRows = []; browseShown = 0; browseUnlocked = false; $("browse-list").innerHTML = ""; setMsg($("browse-msg"), ""); $("browse-more").hidden = true; $("browse-unlock").hidden = true; $("browse").open = false;
  renderStatus();
  updateStepLabels();
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
