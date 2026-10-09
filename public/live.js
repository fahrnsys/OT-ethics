/* Live facilitator UI. The participant answers in their own words; a model judges the answer against the Code.
 *
 * Two backends share one interface (cases, stage, answer, reflect, debrief):
 *   remote  - POST /api/facilitate on the server that holds the API key and the later stages of each case
 *   sample  - inside a Claude artifact, the page asks Claude through its `sample` capability and runs the same
 *             facilitator core in the browser (case data is published to that private page)
 * On the server, later stages are released only against a signed progress token (see api/facilitate.js). */
const V = { ok: "Aligned with the Code", mid: "Partly aligned", bad: "Conflicts with the Code" };
const $ = id => document.getElementById(id);
const stream = $("stream"), factsEl = $("facts"), anchorsEl = $("anchors"), freeEl = $("free"), sendBtn = $("send");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 60) : ms));
let backend, catalog = { cases: [], topics: [] }, C, S, mode = "boot", epoch = 0, accessCode = "";

/* ---------- helpers ---------- */
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(t) { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
function scroll() { requestAnimationFrame(() => { stream.scrollTop = stream.scrollHeight; }); }
const topicLabel = id => (catalog.topics.find(t => t.id === id) || {}).label || id;
const chipLabel = id => id.startsWith("CV:") ? "Value: " + id.slice(3) : id;
const store = {
  get(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  done() { try { return new Set(JSON.parse(localStorage.getItem("otec-live-done") || "[]")); } catch (e) { return new Set(); } },
  markDone(id) { try { const s = store.done(); s.add(id); localStorage.setItem("otec-live-done", JSON.stringify([...s])); } catch (e) { /* storage unavailable */ } }
};

/* ---------- backends ---------- */
class BackendError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

function remoteBackend() {
  async function call(body) {
    let res;
    try {
      res = await fetch("/api/facilitate", { method: "POST", headers: { "Content-Type": "application/json", "x-access-code": accessCode }, body: JSON.stringify(body) });
    } catch (e) { throw new BackendError("network", "Could not reach the server."); }
    let data = null; try { data = await res.json(); } catch (e) { /* not JSON */ }
    if (!res.ok) throw new BackendError((data && data.error) || "http_" + res.status, data && data.message);
    return data;
  }
  return {
    kind: "remote", label: "Live facilitator",
    ping: () => call({ op: "ping" }),
    cases: () => call({ op: "cases" }),
    stage: a => call({ op: "stage", ...a }),
    answer: a => call({ op: "answer", ...a }),
    reflect: a => call({ op: "reflect", ...a }),
    debrief: a => call({ op: "debrief", ...a })
  };
}

function sampleBackend(sample, cases, code) {
  const ask = async ({ system, user, schema, kind }) => {
    const props = Object.entries(schema.properties).map(([k, v]) => `"${k}": ${v.enum ? v.enum.map(x => JSON.stringify(x)).join(" | ") : v.type === "array" ? "array of strings" : v.type}`).join(", ");
    const prompt = system.map(b => b.text).join("\n\n") + "\n\n---\n\n" + user + "\n\nReply with only one JSON object with exactly these keys: { " + props + " }";
    try { return await sample.json(prompt, { cache: false, modelTier: kind === "answer" || kind === "debrief" ? "default" : "quick" }); }
    catch (e) { throw new BackendError(e && e.code ? "sample_" + e.code : "server_error", e && e.message); }
  };
  const f = Facilitator.create({ cases, code, ask });
  const wrap = fn => async a => { try { return await fn(a); } catch (e) { throw e instanceof BackendError ? e : new BackendError(e.status === 400 ? "bad_request" : "server_error", e.message); } };
  return {
    kind: "sample", label: "Live facilitator (preview)",
    cases: async () => ({ cases: f.listCases(), topics: f.topics() }),
    stage: wrap(async a => f.getStage(a)), answer: wrap(a => f.answer(a)), reflect: wrap(a => f.reflect(a)), debrief: wrap(a => f.debrief(a))
  };
}

function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("load " + src)); document.head.appendChild(s); }); }

async function detectBackend() {
  /* inside a Claude artifact the page asks Claude itself; anywhere else it uses the server route */
  if (window.claude && typeof window.claude.use === "function") {
    try {
      const sample = await window.claude.use("sample");
      if (sample) { await loadScript("cases.js"); return sampleBackend(sample, { CASES, TOPICS }, { PRINCIPLES, VALUES, STD, SECTIONS, BEYOND_NOTE }); }
    } catch (e) { /* fall through to the server */ }
  }
  const remote = remoteBackend();
  let info;
  try { info = await remote.ping(); } catch (e) { return { failed: e.code === "network" ? "unreachable" : e.code }; }
  if (!info.configured) return { failed: "not_configured" };
  if (info.codeRequired) {
    accessCode = store.get("otec-code");
    if (accessCode) { try { await remote.cases(); } catch (e) { accessCode = ""; } }
    if (!accessCode) return { needsCode: true, remote };
  }
  return remote;
}

/* ---------- friendly errors ---------- */
function friendly(e) {
  const c = e && e.code;
  if (c === "rate_limited" || c === "sample_rate_limited") return "Too many requests in a short time. Please wait a few minutes and try again.";
  if (c === "refused" || c === "sample_refused") return "I can't help with that request. Describe what you would do in the case, and I will respond through the Code.";
  if (c === "stage_locked") return "That stage is not unlocked yet. Please restart the case from the library.";
  if (c === "access_code_required") return "The access code was not accepted. Reload the page to enter it again.";
  if (c === "network") return "I could not reach the server. Check your connection and send your answer again.";
  if (c === "sample_not_granted" || c === "sample_sampling_disabled" || c === "sample_capability_disabled") return "Claude is not available for this view, so the live facilitator cannot answer.";
  if (c === "upstream_auth") return "The facilitator's connection to Claude was rejected. The site owner needs to check the ANTHROPIC_API_KEY in Vercel (error: upstream_auth).";
  if (c === "upstream_forbidden") return "This key is not allowed to use the configured model. The site owner needs to check ANTHROPIC_API_KEY or ANTHROPIC_MODEL (error: upstream_forbidden).";
  if (c === "upstream_model") return "The configured model was not found for this key. The site owner can set ANTHROPIC_MODEL to a model the key can use (error: upstream_model).";
  if (c === "upstream_bad_request") return "Claude rejected the request. The site owner can check the Vercel function logs (error: upstream_bad_request).";
  if (c === "upstream_rate" || c === "upstream_busy") return "Claude is busy right now. Please wait a moment and send your answer again.";
  if (c === "upstream_unreachable") return "The server could not reach Claude. Please try again in a minute (error: upstream_unreachable).";
  if (c && c.startsWith("http_5")) return "The server timed out or crashed while answering. Try again; if it repeats, the site owner should check the Vercel function logs (error: " + c + ").";
  if (c === "sample_invalid_json" || c === "invalid_json" || c === "truncated") return "I could not put together a reliable reply that time. Please send your answer again.";
  return "Something went wrong on my side" + (c ? " (error: " + c + ")" : "") + ". Please send your answer again.";
}

/* ---------- messages ---------- */
function say(html) { const m = el("div", "msg"); m.append(el("div", "who", "Facilitator"), el("div", "bubble", html)); return m; }
function sayText(text) { const m = el("div", "msg"); const b = el("div", "bubble"); b.textContent = text; m.append(el("div", "who", "Facilitator"), b); return m; }
function noteNode(n) { const d = el("div", "note"); d.innerHTML = `<span class="tag-l">${n.note}</span>${n.html}`; return d; }
function userNode(text) { const m = el("div", "msg you"); const b = el("div", "bubble"); b.textContent = text; m.append(el("div", "who", "You"), b); return m; }
function chipBtn(a) { const b = el("button", "chip", esc(a.label)); b.type = "button"; b.addEventListener("click", () => openCode(a.id)); return b; }
function chipRow(list) { const r = el("div", "chips"); list.forEach(a => r.appendChild(chipBtn(a))); return r; }
const asRef = id => ({ id, label: chipLabel(id) });

function typing() { const t = el("div", "typing", "<i></i><i></i><i></i>"); stream.appendChild(t); scroll(); return t; }
async function post(node, delay = 650) {
  const my = epoch, t = typing();
  await sleep(delay);
  if (my !== epoch) return false;
  t.remove(); stream.appendChild(node); scroll(); return true;
}

function addFacts(list, stageNo) {
  if (!list.length) return;
  if (!S.factCount) factsEl.innerHTML = "";
  factsEl.querySelectorAll(".fresh").forEach(x => x.classList.remove("fresh"));
  list.forEach(f => { const li = el("li", "fresh"); li.innerHTML = `<small>Stage ${stageNo}</small>${esc(f)}`; factsEl.appendChild(li); S.facts.push(f); S.factCount++; });
  $("tabFile").textContent = `Case file (${S.factCount})`;
}
function addAnchors(list) {
  if (!S.anchors.size) anchorsEl.innerHTML = "";
  list.forEach(a => { if (!S.anchors.has(a.id)) { S.anchors.add(a.id); anchorsEl.appendChild(chipBtn(a)); } });
}
function setComposer(placeholder, enabled) { freeEl.placeholder = placeholder; freeEl.disabled = !enabled; sendBtn.disabled = !enabled; if (enabled && !reduce) freeEl.focus({ preventScroll: true }); }
function renderProgress() {
  const p = $("progress"); p.innerHTML = "";
  for (let i = 0; i < S.total + 1; i++) p.appendChild(el("div", "seg" + (i < S.stage ? " done" : i === S.stage ? " now" : "")));
  p.appendChild(el("span", null, S.stage < S.total ? `Stage ${S.stage + 1} of ${S.total}` : "Debrief"));
}

/* ---------- library ---------- */
function setView(view) {
  $("library").hidden = view !== "library"; $("main").hidden = view !== "chat"; $("tabs").classList.toggle("on", view === "chat");
  if (view !== "chat") $("progress").innerHTML = "";
}
function renderLibrary() {
  mode = "library"; epoch++; setView("library");
  $("sub").textContent = `${backend ? backend.label : "AOTA 2025 Code of Ethics"} · ${catalog.cases.length} cases`;
  const done = store.done(), lib = $("library"); lib.innerHTML = "";
  lib.appendChild(el("p", "lead", "Answer in your own words. The facilitator may ask a question before it judges, then tells you how your answer reads against the AOTA 2025 Code of Ethics and reveals what happens next. Every citation comes from the Code itself."));
  const cards = el("div", "cards");
  catalog.cases.forEach(c => {
    const card = el("div", "card"), meta = el("div", "meta", `<span>${esc(c.setting)}</span><span>${c.stages} stages</span>`);
    if (done.has(c.id)) meta.appendChild(el("span", "done-badge", "Completed"));
    card.append(el("h3", null, esc(c.title)), meta, el("p", null, esc(c.blurb)));
    const tags = el("div", "tags"); c.topics.forEach(t => tags.appendChild(el("span", "tag", esc(topicLabel(t))))); card.appendChild(tags);
    const b = el("button", "btn primary", done.has(c.id) ? "Play again" : "Start case"); b.type = "button"; b.addEventListener("click", () => startCase(c.id)); card.appendChild(b);
    cards.appendChild(card);
  });
  const h1 = el("div"); h1.append(el("h2", null, "Cases"), cards); lib.appendChild(h1);
  const mx = el("div", "matrix");
  catalog.topics.forEach(t => {
    const row = el("div", "mrow"); row.appendChild(el("div", "t", esc(t.label)));
    const links = el("div", "mlinks");
    catalog.cases.filter(c => c.stageTopics.some(s => s.includes(t.id))).forEach(c => {
      const n = c.stageTopics.filter(s => s.includes(t.id)).length;
      const b = el("button", null, `${esc(c.title)}${n > 1 ? " ×" + n : ""}`); b.type = "button"; b.addEventListener("click", () => startCase(c.id)); links.appendChild(b);
    });
    row.appendChild(links); mx.appendChild(row);
  });
  const h2 = el("div"); h2.append(el("h2", null, "Scenarios and where they appear"), mx); lib.appendChild(h2);
}

function renderNotice(title, html) {
  mode = "unavailable"; setView("library"); $("sub").textContent = "AOTA 2025 Code of Ethics";
  const lib = $("library"); lib.innerHTML = "";
  const card = el("div", "card"); card.style.maxWidth = "560px";
  card.append(el("h3", null, esc(title)), el("p", null, html));
  lib.appendChild(card);
}
function renderCodeGate(remote) {
  mode = "gate"; setView("library"); $("sub").textContent = "AOTA 2025 Code of Ethics";
  const lib = $("library"); lib.innerHTML = "";
  const card = el("form", "card"); card.style.maxWidth = "420px";
  card.append(el("h3", null, "Enter the access code"), el("p", null, "This facilitator is limited to invited participants."));
  const input = el("input"); input.type = "password"; input.id = "gate"; input.setAttribute("aria-label", "Access code"); input.autocomplete = "off";
  input.style.cssText = "border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:6px;padding:8px 10px;font:inherit;";
  const err = el("div", "empty"), go = el("button", "btn primary", "Continue"); go.type = "submit";
  card.append(input, err, go);
  card.addEventListener("submit", async e => {
    e.preventDefault(); accessCode = input.value.trim(); err.textContent = "";
    try { catalog = await remote.cases(); store.set("otec-code", accessCode); backend = remote; renderLibrary(); }
    catch (x) { accessCode = ""; err.textContent = x.code === "access_code_required" ? "That code was not accepted." : friendly(x); }
  });
  lib.appendChild(card);
}

/* ---------- play ---------- */
async function startCase(id) {
  C = catalog.cases.find(c => c.id === id); epoch++; mode = "busy";
  S = { stage: 0, total: C.stages, v: {}, token: "", pending: null, picks: [], anchors: new Set(), notes: [], facts: [], factCount: 0, turns: [], clarify: 0, reflections: 0, assessment: null };
  setView("chat"); $("sub").textContent = `${C.title} · ${C.setting}`; $("beyondNote").textContent = BEYOND_NOTE;
  stream.innerHTML = ""; factsEl.innerHTML = '<li class="empty">Nothing revealed yet.</li>'; anchorsEl.innerHTML = '<span class="empty">None yet.</span>';
  $("tabFile").textContent = "Case file"; tab("chat"); setComposer("Waiting for the case…", false);
  runStage();
}

async function runStage() {
  const my = epoch; mode = "busy"; renderProgress(); setComposer("Reading the case…", false);
  let st;
  try { st = await backend.stage({ caseId: C.id, stage: S.stage, vars: S.v, token: S.token }); }
  catch (e) { stream.appendChild(sayText(friendly(e))); scroll(); return; }
  S.stageKey = st.key;
  for (const n of st.narrative) {
    if (!(await post(n.say ? say(esc(n.say)) : noteNode(n), n.say ? 500 : 900)) || my !== epoch) return;
    if (n.facts) addFacts(n.facts, S.stage + 1);
  }
  if (!(await post(say(`<span class="ask">${esc(st.ask)}</span><br><span class="empty">Answer in your own words. Say what you would do and why.</span>`), 600))) return;
  S.turns = []; S.clarify = 0; S.reflections = 0; S.assessment = null;
  mode = "answer"; setComposer("Type what you would do and why…", true);
}

async function handleAnswer(text) {
  mode = "busy"; setComposer("Thinking…", false);
  const my = epoch, t = typing();
  let r;
  try { r = await backend.answer({ caseId: C.id, stage: S.stage, vars: S.v, token: S.token, answer: text, facts: S.facts, turns: S.turns, clarifyCount: S.clarify }); }
  catch (e) {
    t.remove(); if (my !== epoch) return;
    stream.appendChild(sayText(friendly(e))); scroll();
    if (e.code === "access_code_required") return;
    mode = "answer"; setComposer("Type what you would do and why…", true); freeEl.value = text; return;
  }
  t.remove(); if (my !== epoch) return;

  if (r.kind === "clarify" || r.kind === "info") {
    S.turns.push({ role: "participant", text }, { role: "facilitator", text: r.message });
    if (r.kind === "clarify") S.clarify++;
    const m = sayText(r.message); if (r.anchors && r.anchors.length) { const c = chipRow(r.anchors); c.style.marginTop = "8px"; m.lastChild.appendChild(c); }
    stream.appendChild(m); scroll();
    mode = "answer"; setComposer(r.kind === "clarify" ? "Answer the question, or add more detail…" : "Now say what you would do and why…", true); return;
  }

  /* an assessment: verdict, feedback, Code anchors, then a probing question */
  /* the next stage opens only when the participant continues; remote play gets a signed token for it */
  S.pending = r.next ? { vars: r.next.vars, token: r.next.token } : { vars: r.nextVars || S.v, token: "" };
  S.picks.push({ stage: S.stageKey || `Stage ${S.stage + 1}`, label: text, verdict: r.verdict, anchors: r.anchors.map(a => a.id) });
  addAnchors(r.anchors); S.assessment = { message: r.message, probe: r.probe };

  const fb = el("div", "msg"); fb.append(el("div", "who", "Facilitator"));
  const bub = el("div", "bubble"), body = el("div"); body.style.marginTop = "8px"; body.textContent = r.message;
  bub.append(el("span", "verdict " + r.verdict, V[r.verdict]), body);
  if (r.beyond) bub.appendChild(el("div", "beyond", `<b>Beyond the Code</b>${esc(r.beyond)}`));
  const ch = chipRow(r.anchors); ch.style.marginTop = "10px"; bub.appendChild(ch);
  const pr = el("div", "probe"); pr.style.marginTop = "10px"; pr.textContent = r.probe; bub.appendChild(pr);
  fb.appendChild(bub);
  if (!(await post(fb, 300))) return;
  addFacts(r.reveal || [], S.stage + 1);

  const go = el("div", "options"), last = S.stage + 1 >= S.total;
  const nb = el("button", "opt", last ? "Continue to the debrief" : "Continue to the next stage"); nb.type = "button"; nb.style.fontWeight = "600";
  nb.addEventListener("click", () => {
    if (mode !== "reflect") return; nb.disabled = true; stream.appendChild(userNode("Continue"));
    if (S.pending) { S.v = S.pending.vars; S.token = S.pending.token; S.pending = null; }
    S.stage++;
    S.stage < S.total ? runStage() : runDebrief();
  });
  go.appendChild(nb); stream.appendChild(go); scroll();
  mode = "reflect"; setComposer("Reply to the question, or continue…", true);
}

async function handleReflect(text) {
  S.notes.push(text);
  if (S.reflections >= 2) { stream.appendChild(sayText("Noted. It will appear in your debrief. Continue when you are ready.")); scroll(); return; }
  mode = "busy"; setComposer("Thinking…", false);
  const my = epoch, t = typing();
  try {
    const r = await backend.reflect({ caseId: C.id, stage: S.stage, vars: S.v, token: S.token, text, facts: S.facts, assessment: S.assessment, count: S.reflections });
    t.remove(); if (my !== epoch) return; S.reflections++;
    const m = sayText(r.message); if (r.anchors && r.anchors.length) { const c = chipRow(r.anchors); c.style.marginTop = "8px"; m.lastChild.appendChild(c); }
    stream.appendChild(m); scroll();
  } catch (e) { t.remove(); if (my !== epoch) return; stream.appendChild(sayText("Noted. It will appear in your debrief. Continue when you are ready.")); scroll(); }
  mode = "reflect"; setComposer("Reply, or continue…", true);
}

async function runDebrief() {
  mode = "busy"; renderProgress(); setComposer("Debrief", false); store.markDone(C.id); const my = epoch;
  for (const t of ["That is the end of the case. Before I show how your answers map to the Code, one reflection question.", "Which Principles were in tension for you? Select all that apply, then reveal."])
    if (!(await post(say(esc(t)), 600))) return;
  const sel = new Set(), row = el("div", "reflect");
  Object.keys(PRINCIPLES).forEach(n => {
    const b = el("button", "opt", n); b.type = "button"; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => { sel.has(n) ? sel.delete(n) : sel.add(n); b.setAttribute("aria-pressed", sel.has(n)); }); row.appendChild(b);
  });
  const reveal = el("button", "btn primary", "Reveal the debrief"); reveal.type = "button"; reveal.style.alignSelf = "flex-start";
  const wrap = el("div", "options"); wrap.append(row, reveal); stream.appendChild(wrap); scroll(); mode = "reflect-final";

  reveal.addEventListener("click", async () => {
    if (mode !== "reflect-final") return; mode = "busy";
    row.querySelectorAll("button").forEach(b => { b.disabled = true; }); reveal.disabled = true;
    stream.appendChild(userNode(sel.size ? [...sel].join(", ") : "No selection")); scroll();
    const t = typing(); let d;
    try { d = await backend.debrief({ caseId: C.id, picks: S.picks, notes: S.notes, principles: [...sel] }); }
    catch (e) { t.remove(); if (my !== epoch) return; d = { summary: "I could not write a personal summary this time. Your decisions and the Code anchors are below.", anchors: [], tensions: [], beyond: BEYOND_NOTE }; }
    t.remove(); if (my !== epoch) return;

    const sm = el("div", "msg"); sm.append(el("div", "who", "Facilitator"));
    const sb = el("div", "bubble"); sb.append(el("strong", null, "Your debrief")); const p = el("p"); p.style.margin = "8px 0 0"; p.textContent = d.summary; sb.appendChild(p);
    if (d.anchors && d.anchors.length) { const c = chipRow(d.anchors); c.style.marginTop = "10px"; sb.appendChild(c); }
    (d.tensions || []).forEach(([h, x]) => { const q = el("p"); q.style.margin = "8px 0 0"; q.innerHTML = `<strong>${esc(h)}.</strong> ${esc(x)}`; sb.appendChild(q); });
    sm.appendChild(sb); if (!(await post(sm, 300))) return;

    const m = el("div", "note"); m.innerHTML = `<span class="tag-l">Your decisions against the Code</span>`;
    S.picks.forEach(pk => { const r = el("div", "maprow"); r.append(el("div", "t", esc(pk.stage)), el("span", "verdict " + pk.verdict, V[pk.verdict]), el("div", null, esc(pk.label)), chipRow(pk.anchors.map(asRef))); m.appendChild(r); });
    if (S.notes.length) { const nr = el("div", "maprow"); nr.append(el("div", "t", "Your notes")); S.notes.forEach(n => nr.appendChild(el("div", null, esc(n)))); m.appendChild(nr); }
    if (!(await post(m, 600))) return;
    if (!(await post(say(esc(d.beyond || BEYOND_NOTE)), 500))) return;

    const mine = new Set(C.topics);
    const related = catalog.cases.filter(c => c.id !== C.id).map(c => ({ c, n: c.topics.filter(x => mine.has(x)).length })).filter(x => x.n).sort((a, b) => b.n - a.n).slice(0, 3);
    const next = el("div", "options");
    related.forEach(({ c, n }) => { const r = el("button", "opt", `Play “${esc(c.title)}” (${n} shared scenario${n > 1 ? "s" : ""})`); r.type = "button"; r.addEventListener("click", () => startCase(c.id)); next.appendChild(r); });
    const lib = el("button", "opt", "Back to the case library"); lib.type = "button"; lib.style.fontWeight = "600"; lib.addEventListener("click", renderLibrary); next.appendChild(lib);
    stream.appendChild(next); scroll(); mode = "done";
  });
}

/* ---------- composer ---------- */
function lookupOnly(text) {
  const t = text.trim();
  if (t.length > 24) return null;
  const std = t.toUpperCase().match(/^(?:STANDARD\s+)?([0-9][A-Z])$/);
  if (std) return { std: std[1] };
  const low = t.toLowerCase().replace(/^(principle of|core value|value)\s+/, "");
  const pr = Object.keys(PRINCIPLES).find(p => p.toLowerCase() === low), cv = Object.keys(VALUES).find(v => v.toLowerCase() === low);
  return pr || cv ? { pr, cv } : null;
}
function stdCard(id) {
  const [p, t] = STD[id], d = el("div", "stdcard");
  d.innerHTML = `<div class="k">Standard ${id} · ${SECTIONS[id[0]]}</div><div style="margin-top:6px">${esc(t)}</div>${p ? `<div class="p">Principle: ${p}</div>` : ""}`;
  return d;
}
$("composer").addEventListener("submit", async e => {
  e.preventDefault();
  const text = freeEl.value.trim(); if (!text || freeEl.disabled) return;
  const lk = lookupOnly(text);
  freeEl.value = ""; stream.appendChild(userNode(text)); scroll();
  if (lk) {
    if (lk.std) { stream.appendChild(STD[lk.std] ? stdCard(lk.std) : sayText(`I only have the Standards these cases use loaded for lookup, and ${lk.std} is not one of them. The full Code is the authority.`)); }
    else { const parts = []; if (lk.pr) parts.push(`<strong>Principle of ${lk.pr}.</strong> ${esc(PRINCIPLES[lk.pr])}`); if (lk.cv) parts.push(`<strong>Core Value, ${lk.cv}</strong> ${esc(VALUES[lk.cv])}`); stream.appendChild(say(parts.join("<br><br>"))); }
    scroll(); return;
  }
  if (mode === "answer") return handleAnswer(text);
  if (mode === "reflect") return handleReflect(text);
});
/* the userNode for answers is added once above; remove duplicate echo inside handlers by design: handlers do not echo */

/* ---------- Code reference sheet ---------- */
function openCode(hl) {
  const b = $("codeBody"); b.innerHTML = "<h3>Principles</h3>";
  Object.entries(PRINCIPLES).forEach(([k, v]) => { const d = el("div", "std"); d.innerHTML = `<b></b><div><strong>${k}.</strong> ${esc(v)}</div>`; b.appendChild(d); });
  b.appendChild(el("h3", null, "Core Values"));
  Object.entries(VALUES).forEach(([k, v]) => { const d = el("div", "std" + (hl === "CV:" + k ? " hl" : "")); d.id = "std-CV-" + k; d.innerHTML = `<b></b><div><strong>${k}</strong> ${esc(v)}</div>`; b.appendChild(d); });
  let cur = "";
  Object.keys(STD).sort().forEach(id => {
    if (id[0] !== cur) { cur = id[0]; b.appendChild(el("h3", null, `${cur}. ${SECTIONS[cur]}`)); }
    const d = el("div", "std" + (id === hl ? " hl" : "")); d.id = "std-" + id;
    d.innerHTML = `<b>${id}</b><div>${esc(STD[id][1])}${STD[id][0] ? `<em>Principle: ${STD[id][0]}</em>` : ""}</div>`; b.appendChild(d);
  });
  $("overlay").hidden = false;
  if (hl) { const t = $(hl.startsWith("CV:") ? "std-CV-" + hl.slice(3) : "std-" + hl); if (t) t.scrollIntoView({ block: "center" }); }
}
$("btnCode").addEventListener("click", () => openCode());
$("btnClose").addEventListener("click", () => { $("overlay").hidden = true; });
$("overlay").addEventListener("click", e => { if (e.target.id === "overlay") $("overlay").hidden = true; });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("overlay").hidden = true; });
function tab(t) { $("app").dataset.tab = t; $("tabChat").setAttribute("aria-selected", t === "chat"); $("tabFile").setAttribute("aria-selected", t === "file"); }
$("tabChat").addEventListener("click", () => tab("chat")); $("tabFile").addEventListener("click", () => tab("file"));
$("btnLib").addEventListener("click", () => { if (backend && catalog.cases.length) renderLibrary(); });

/* ---------- boot ---------- */
(async function boot() {
  setView("library"); $("library").innerHTML = '<p class="lead">Connecting to the facilitator…</p>';
  const b = await detectBackend();
  if (b.failed === "not_configured") return renderNotice("The live facilitator is not set up yet", "This server has no API key configured. An administrator needs to set <code>ANTHROPIC_API_KEY</code>. Once it is set and the site is redeployed, this page will work.");
  if (b.failed) return renderNotice("The live facilitator is unavailable", "I could not reach the facilitator service. Check your connection and reload the page.");
  if (b.needsCode) return renderCodeGate(b.remote);
  try { backend = b; catalog = await backend.cases(); } catch (e) { return renderNotice("The live facilitator is unavailable", friendly(e)); }
  renderLibrary();
})();
