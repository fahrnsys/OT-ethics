/* Deterministic stand-in for the model, used by tests and `npm run dev:mock`. It only returns shapes that match the
   facilitator schemas, so the real validation and branching code is exercised without any API call. */
const words = s => new Set(String(s).toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(w => w.length > 3));
const overlap = (a, b) => { let n = 0; for (const w of a) if (b.has(w)) n++; return n / Math.max(3, Math.min(a.size, b.size)); };

module.exports = async function mockAsk({ kind, ctx }) {
  if (kind === "answer") {
    const a = ctx.answer, aw = words(a);
    if (/\?\s*$/.test(a.trim())) return { status: "info", message: "The case does not say. What would you do if it were true, and what if it were not?", verdict: "none", matched_option: -1, anchors: ["4E"], principles: [], probe: "", consequence: "", beyond_code: "" };
    if (a.trim().split(/\s+/).length < 6 && ctx.clarifyCount < 2) return { status: "clarify", message: "Can you say what you would actually do first, and who you would talk to?", verdict: "none", matched_option: -1, anchors: [], principles: [], probe: "", consequence: "", beyond_code: "" };
    const scored = ctx.options.map((o, i) => ({ i, s: overlap(aw, words(o.label)) })).sort((x, y) => y.s - x.s);
    const best = scored[0].s >= 0.3 ? scored[0].i : -1;
    const ok = ctx.options.find(o => o.verdict === "ok") || ctx.options[0];
    return {
      status: "assess", message: "You named a clear action. 3C and 2B both bear on it, and the Code asks you to weigh them rather than rank them. That is a considered start.",
      verdict: best >= 0 ? ctx.options[best].verdict : "mid", matched_option: best, anchors: ok.anchors.slice(0, 3), principles: ["Autonomy", "Veracity"],
      probe: "What would you want the person affected to say about this a month from now?",
      consequence: best >= 0 ? "" : "Your approach changes the next conversation, and the people involved notice.", beyond_code: ""
    };
  }
  if (kind === "reflect") return { message: "That is a thoughtful point, and it connects to 2B on shared decision-making. Continue when you are ready.", anchors: ["2B"] };
  return { summary: "You tied several decisions to the record and to the person in front of you, which served you well. 3C asks for more consistency where pressure rose. Which pressure will you meet first in practice?", anchors: ["3C", "CV:Truth"] };
};
