/* Facilitator engine: case library, staged reveal, feedback bounded to the Code in code.js. */
const V = { ok: "Aligned with the Code", mid: "Partly aligned", bad: "Conflicts with the Code" };
const $ = id => document.getElementById(id);
const stream = $("stream"), factsEl = $("facts"), anchorsEl = $("anchors");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 60) : ms));
let C, S, mode = "library", epoch = 0;

/* ---------- small helpers ---------- */
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(t) { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
function scroll() { requestAnimationFrame(() => { stream.scrollTop = stream.scrollHeight; }); }
function topicLabel(id) { return (TOPICS.find(t => t.id === id) || {}).label || id; }
function caseTopics(c) { return [...new Set(c.stages.flatMap(s => s.topics))]; }
function chipLabel(id) { return id.startsWith("CV:") ? "Value: " + id.slice(3) : id; }

/* completed cases are a per-viewer convenience, so every storage call is guarded */
function doneSet() { try { return new Set(JSON.parse(localStorage.getItem("otec-done") || "[]")); } catch (e) { return new Set(); } }
function markDone(id) { try { const s = doneSet(); s.add(id); localStorage.setItem("otec-done", JSON.stringify([...s])); } catch (e) { /* storage unavailable */ } }

/* ---------- library ---------- */
function renderLibrary() {
  mode = "library"; epoch++;
  $("library").hidden = false; $("main").hidden = true; $("tabs").classList.remove("on");
  $("progress").innerHTML = ""; $("sub").textContent = `AOTA 2025 Code of Ethics · ${CASES.length} cases`;
  const done = doneSet(), lib = $("library"); lib.innerHTML = "";
  lib.appendChild(el("p", "lead", "Each case is a story told a piece at a time. What you decide changes what is revealed next, and every piece of feedback is tied to the AOTA 2025 Code of Ethics. Scenarios recur across cases, so the same issue shows up in different settings."));

  const cards = el("div", "cards");
  CASES.forEach(c => {
    const card = el("div", "card");
    const meta = el("div", "meta", `<span>${esc(c.setting)}</span><span>${c.stages.length} stages</span>`);
    if (done.has(c.id)) meta.appendChild(el("span", "done-badge", "Completed"));
    card.append(el("h3", null, esc(c.title)), meta, el("p", null, esc(c.blurb)));
    const tags = el("div", "tags"); caseTopics(c).forEach(t => tags.appendChild(el("span", "tag", esc(topicLabel(t))))); card.appendChild(tags);
    const b = el("button", "btn primary", done.has(c.id) ? "Play again" : "Start case"); b.type = "button"; b.addEventListener("click", () => startCase(c.id));
    card.appendChild(b); cards.appendChild(card);
  });
  const h1 = el("div"); h1.append(el("h2", null, "Cases"), cards); lib.appendChild(h1);

  const mx = el("div", "matrix");
  TOPICS.forEach(t => {
    const row = el("div", "mrow"); row.appendChild(el("div", "t", esc(t.label)));
    const links = el("div", "mlinks");
    CASES.filter(c => c.stages.some(s => s.topics.includes(t.id))).forEach(c => {
      const n = c.stages.filter(s => s.topics.includes(t.id)).length;
      const b = el("button", null, `${esc(c.title)}${n > 1 ? " ×" + n : ""}`); b.type = "button"; b.addEventListener("click", () => startCase(c.id)); links.appendChild(b);
    });
    row.appendChild(links); mx.appendChild(row);
  });
  const h2 = el("div"); h2.append(el("h2", null, "Scenarios and where they appear"), mx); lib.appendChild(h2);
}

/* ---------- case state and side panel ---------- */
function fresh() { return { stage: 0, v: {}, picks: [], anchors: new Set(), notes: [], factCount: 0 }; }

function post(node, delay = 650) {
  const my = epoch;
  const t = el("div", "typing", "<i></i><i></i><i></i>");
  stream.appendChild(t); scroll();
  return sleep(delay).then(() => {
    if (my !== epoch) return false;
    t.remove(); stream.appendChild(node); scroll(); return true;
  });
}
function say(html) { const m = el("div", "msg"); m.append(el("div", "who", "Facilitator"), el("div", "bubble", html)); return m; }
function noteNode(n) { const d = el("div", "note"); d.innerHTML = `<span class="tag-l">${n.note}</span>${n.html}`; return d; }
function userNode(text) { const m = el("div", "msg you"); m.append(el("div", "who", "You"), el("div", "bubble", esc(text))); return m; }

function addFacts(list, stageNo) {
  if (!S.factCount) factsEl.innerHTML = "";
  factsEl.querySelectorAll(".fresh").forEach(x => x.classList.remove("fresh"));
  list.forEach(f => { const li = el("li", "fresh"); li.innerHTML = `<small>Stage ${stageNo}</small>${esc(f)}`; factsEl.appendChild(li); S.factCount++; });
  $("tabFile").textContent = `Case file (${S.factCount})`;
}
function addAnchors(list) {
  if (!S.anchors.size) anchorsEl.innerHTML = "";
  list.forEach(id => { if (!S.anchors.has(id)) { S.anchors.add(id); anchorsEl.appendChild(chipBtn(id)); } });
}
function chipBtn(id) { const b = el("button", "chip", esc(chipLabel(id))); b.type = "button"; b.addEventListener("click", () => openCode(id)); return b; }
function chipRow(ids) { const r = el("div", "chips"); ids.forEach(i => r.appendChild(chipBtn(i))); return r; }

function renderProgress() {
  const p = $("progress"); p.innerHTML = "";
  for (let i = 0; i < C.stages.length + 1; i++) p.appendChild(el("div", "seg" + (i < S.stage ? " done" : i === S.stage ? " now" : "")));
  p.appendChild(el("span", null, S.stage < C.stages.length ? `Stage ${S.stage + 1} of ${C.stages.length}` : "Debrief"));
}

/* ---------- staged play ---------- */
async function runStage() {
  mode = "busy"; renderProgress();
  const st = C.stages[S.stage];
  for (const n of st.narrative(S)) {
    if (!(await post(n.say ? say(n.say) : noteNode(n), n.say ? 500 : 900))) return;
    if (n.facts) addFacts(n.facts, S.stage + 1);
  }
  if (!(await post(say(`<span class="ask">${st.ask}</span>`), 600))) return;
  const box = el("div", "options");
  st.options.forEach((o, i) => {
    const b = el("button", "opt", esc(o.label)); b.type = "button";
    b.addEventListener("click", () => choose(i, box, b));
    box.appendChild(b);
  });
  stream.appendChild(box); scroll();
  mode = "choose";
}

async function choose(i, box, btn) {
  if (mode !== "choose") return;
  mode = "busy";
  const st = C.stages[S.stage], o = st.options[i];
  box.querySelectorAll(".opt").forEach(b => { b.disabled = true; }); btn.classList.add("pick");
  stream.appendChild(userNode(o.label)); scroll();
  if (o.set) Object.assign(S.v, o.set);
  if (o.inc) Object.entries(o.inc).forEach(([k, n]) => { S.v[k] = (S.v[k] || 0) + n; });
  S.picks.push({ stage: st.key, label: o.label, verdict: o.verdict, anchors: o.anchors });
  addAnchors(o.anchors);

  const fb = el("div", "msg"); fb.append(el("div", "who", "Facilitator"));
  const bub = el("div", "bubble");
  const body = el("div"); body.style.marginTop = "8px"; body.textContent = o.feedback;
  bub.append(el("span", "verdict " + o.verdict, V[o.verdict]), body);
  if (o.beyond) bub.appendChild(el("div", "beyond", `<b>Beyond the Code</b>${esc(o.beyond)}`));
  const ch = chipRow(o.anchors); ch.style.marginTop = "10px"; bub.appendChild(ch);
  const pr = el("div", "probe"); pr.style.marginTop = "10px"; pr.textContent = o.probe; bub.appendChild(pr);
  fb.appendChild(bub);
  if (!(await post(fb, 900))) return;
  if (o.reveal.length) addFacts(o.reveal, S.stage + 1);

  const go = el("div", "options");
  const last = S.stage + 1 >= C.stages.length;
  const nb = el("button", "opt", last ? "Continue to the debrief" : "Continue to the next stage"); nb.type = "button"; nb.style.fontWeight = "600";
  nb.addEventListener("click", () => {
    if (mode !== "probe") return; nb.disabled = true;
    stream.appendChild(userNode("Continue")); S.stage++;
    S.stage < C.stages.length ? runStage() : runDebrief();
  });
  go.appendChild(nb); stream.appendChild(go); scroll();
  mode = "probe";
}

async function runDebrief() {
  mode = "busy"; renderProgress(); markDone(C.id);
  for (const t of ["That is the end of the case. Before I show how your choices map to the Code, one reflection question.", "Which Principles were in tension for you? Select all that apply, then reveal."])
    if (!(await post(say(t), 600))) return;
  const sel = new Set(), row = el("div", "reflect");
  Object.keys(PRINCIPLES).forEach(n => {
    const b = el("button", "opt", n); b.type = "button"; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => { sel.has(n) ? sel.delete(n) : sel.add(n); b.setAttribute("aria-pressed", sel.has(n)); });
    row.appendChild(b);
  });
  const reveal = el("button", "btn primary", "Reveal the debrief"); reveal.type = "button"; reveal.style.alignSelf = "flex-start";
  const wrap = el("div", "options"); wrap.append(row, reveal);
  stream.appendChild(wrap); scroll(); mode = "reflect";

  reveal.addEventListener("click", async () => {
    if (mode !== "reflect") return; mode = "busy";
    row.querySelectorAll("button").forEach(b => { b.disabled = true; }); reveal.disabled = true;
    stream.appendChild(userNode(sel.size ? [...sel].join(", ") : "No selection")); scroll();

    const t = el("div", "msg"); t.append(el("div", "who", "Facilitator"));
    const b = el("div", "bubble"); b.innerHTML = "<strong>Where the tension usually sits</strong>";
    C.tensions.forEach(([h, d]) => { const p = el("p", null, `<strong>${esc(h)}.</strong> ${esc(d)}`); p.style.margin = "8px 0 0"; b.appendChild(p); });
    t.appendChild(b);
    if (!(await post(t, 800))) return;

    const m = el("div", "note"); m.innerHTML = `<span class="tag-l">Your decisions against the Code</span>`;
    S.picks.forEach(p => {
      const r = el("div", "maprow");
      r.append(el("div", "t", esc(p.stage)), el("span", "verdict " + p.verdict, V[p.verdict]), el("div", null, esc(p.label)), chipRow(p.anchors));
      m.appendChild(r);
    });
    if (S.notes.length) { const nr = el("div", "maprow"); nr.append(el("div", "t", "Your notes")); S.notes.forEach(n => nr.appendChild(el("div", null, esc(n)))); m.appendChild(nr); }
    if (!(await post(m, 900))) return;

    const topics = caseTopics(C);
    const tn = el("div", "note"); tn.innerHTML = `<span class="tag-l">Scenarios in this case</span>`;
    const tg = el("div", "tags"); topics.forEach(x => tg.appendChild(el("span", "tag", esc(topicLabel(x))))); tn.appendChild(tg);
    if (!(await post(tn, 700))) return;

    if (!(await post(say(`The Code describes ethical reasoning as analyzing the situation, weighing alternatives, deciding, acting, and reflecting on outcomes. ${esc(BEYOND_NOTE)}`), 700))) return;

    /* suggest the cases that share the most scenarios with this one */
    const related = CASES.filter(c => c.id !== C.id)
      .map(c => ({ c, n: caseTopics(c).filter(x => topics.includes(x)).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 3);
    const next = el("div", "options");
    related.forEach(({ c, n }) => { const r = el("button", "opt", `Play “${esc(c.title)}” (${n} shared scenario${n > 1 ? "s" : ""})`); r.type = "button"; r.addEventListener("click", () => startCase(c.id)); next.appendChild(r); });
    const lib = el("button", "opt", "Back to the case library"); lib.type = "button"; lib.style.fontWeight = "600"; lib.addEventListener("click", renderLibrary);
    next.appendChild(lib); stream.appendChild(next); scroll(); mode = "done";
  });
}

/* ---------- free text: bounded to Code lookup and reflections ---------- */
$("composer").addEventListener("submit", async e => {
  e.preventDefault();
  const inp = $("free"), text = inp.value.trim(); if (!text) return; inp.value = "";
  stream.appendChild(userNode(text)); scroll();
  const std = text.toUpperCase().match(/\b([1-6][A-M])\b/);
  const low = text.toLowerCase();
  const pr = Object.keys(PRINCIPLES).filter(p => low.includes(p.toLowerCase()));
  const cv = Object.keys(VALUES).filter(v => low.includes(v.toLowerCase()));
  if (std && STD[std[1]]) { await post(stdCard(std[1]), 350); return; }
  if (std) { await post(say(`I only have the Standards these cases draw on loaded for lookup, and ${std[1]} is not one of them. The full Code is the authority. You can also ask your ethics committee or the AOTA Ethics Commission.`), 400); return; }
  if (pr.length || cv.length) {
    const parts = [];
    pr.forEach(p => parts.push(`<strong>Principle of ${p}.</strong> ${PRINCIPLES[p]}`));
    cv.forEach(v => parts.push(`<strong>Core Value, ${v}</strong> ${VALUES[v]}`));
    await post(say(parts.join("<br><br>")), 350); return;
  }
  if (mode === "probe" || mode === "choose") {
    S.notes.push(text);
    await post(say(mode === "probe" ? "Noted. It will appear in your debrief. Continue when you are ready." : "Noted. I can only respond through the Code, so choose the option closest to what you would do. You can explain your reasoning here afterward."), 450);
    return;
  }
  await post(say("I can only discuss these cases through the 2025 Code. Try a standard number such as 4G, a Principle such as Autonomy, or a Core Value such as Equity."), 400);
});
function stdCard(id) {
  const [p, t] = STD[id]; const d = el("div", "stdcard");
  d.innerHTML = `<div class="k">Standard ${id} · ${SECTIONS[id[0]]}</div><div style="margin-top:6px">${t}</div>${p ? `<div class="p">Principle: ${p}</div>` : ""}`;
  return d;
}

/* ---------- Code reference sheet ---------- */
function openCode(hl) {
  const b = $("codeBody"); b.innerHTML = "<h3>Principles</h3>";
  Object.entries(PRINCIPLES).forEach(([k, v]) => { const d = el("div", "std"); d.innerHTML = `<b></b><div><strong>${k}.</strong> ${v}</div>`; b.appendChild(d); });
  b.appendChild(el("h3", null, "Core Values"));
  Object.entries(VALUES).forEach(([k, v]) => { const d = el("div", "std" + (hl === "CV:" + k ? " hl" : "")); d.id = "std-CV-" + k; d.innerHTML = `<b></b><div><strong>${k}</strong> ${v}</div>`; b.appendChild(d); });
  let cur = "";
  Object.keys(STD).sort().forEach(id => {
    if (id[0] !== cur) { cur = id[0]; b.appendChild(el("h3", null, `${cur}. ${SECTIONS[cur]}`)); }
    const d = el("div", "std" + (id === hl ? " hl" : "")); d.id = "std-" + id;
    d.innerHTML = `<b>${id}</b><div>${STD[id][1]}${STD[id][0] ? `<em>Principle: ${STD[id][0]}</em>` : ""}</div>`; b.appendChild(d);
  });
  $("overlay").hidden = false;
  if (hl) { const t = $(hl.startsWith("CV:") ? "std-CV-" + hl.slice(3) : "std-" + hl); if (t) t.scrollIntoView({ block: "center" }); }
}
$("btnCode").addEventListener("click", () => openCode());
$("btnClose").addEventListener("click", () => { $("overlay").hidden = true; });
$("overlay").addEventListener("click", e => { if (e.target.id === "overlay") $("overlay").hidden = true; });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("overlay").hidden = true; });

/* ---------- tabs, navigation ---------- */
function tab(t) { $("app").dataset.tab = t; $("tabChat").setAttribute("aria-selected", t === "chat"); $("tabFile").setAttribute("aria-selected", t === "file"); }
$("tabChat").addEventListener("click", () => tab("chat")); $("tabFile").addEventListener("click", () => tab("file"));
$("btnLib").addEventListener("click", renderLibrary);

function startCase(id) {
  C = CASES.find(c => c.id === id); epoch++; S = fresh(); mode = "busy";
  $("library").hidden = true; $("main").hidden = false; $("tabs").classList.add("on");
  $("sub").textContent = `${C.title} · ${C.setting}`;
  $("beyondNote").textContent = BEYOND_NOTE;
  stream.innerHTML = ""; factsEl.innerHTML = '<li class="empty">Nothing revealed yet.</li>';
  anchorsEl.innerHTML = '<span class="empty">None yet.</span>'; $("tabFile").textContent = "Case file"; tab("chat");
  runStage();
}

renderLibrary();
