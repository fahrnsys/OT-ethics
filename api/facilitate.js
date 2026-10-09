/* POST /api/facilitate  (Vercel Node function)
 *
 * The browser never sees the API key or the later stages of a case. Operations:
 *   ping     -> { ok, configured, codeRequired }
 *   cases    -> case list and topic map (no stage content)
 *   stage    -> narrative and question for one stage (no model call)
 *   answer   -> free-text answer, judged against the Code
 *   reflect  -> reply to the probing question
 *   debrief  -> closing summary
 * Progress gate: stage 0 is open. Stage N needs a token that this function signed when the participant's answer to
 * stage N-1 was assessed, so the later stages of a case cannot be read by calling the API out of order.
 * Environment: ANTHROPIC_API_KEY (required), ANTHROPIC_MODEL (optional), ACCESS_CODE (optional),
 *              ANTHROPIC_WORKSPACE_ID (only for keys that are not scoped to a workspace), DEBUG_ERRORS=1 (optional),
 *              PROGRESS_SECRET (optional; defaults to a key derived from ANTHROPIC_API_KEY). */

const crypto = require("crypto");
const code = require("../public/code.js");
const cases = require("../server/cases.js");   // server-only: never served as a static file
const Facilitator = require("../public/facilitator.js");

const DEFAULT_MODEL = "claude-opus-5-5";
const FALLBACK_BETA = "server-side-fallback-2026-07-01";
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5", "claude-fable-5-1"]);
const MODEL_OPS = new Set(["answer", "reflect", "debrief", "selftest"]);
const MAX_BODY_CHARS = 40000;
const RATE = { windowMs: 10 * 60 * 1000, max: 40 };

class ApiError extends Error {
  constructor(status, error, message) { super(message || error); this.status = status; this.error = error; }
}

/* ---------- upstream errors ---------- */
/* Anthropic API failures become specific codes the page can explain. Details go to the function logs;
   they reach the browser only when DEBUG_ERRORS=1, so a visitor never sees upstream internals. */
function translateUpstream(e, env) {
  if (e instanceof ApiError) return e;
  const s = e && e.status, raw = String((e && e.message) || e || "").slice(0, 500);
  console.error("anthropic error:", s || "no-status", (e && e.name) || "", raw);
  let code = "upstream_error", msg = "The model service returned an error.";
  if (s === 401) { code = "upstream_auth"; msg = "The server's Anthropic API key was rejected."; }
  else if (s === 403) { code = "upstream_forbidden"; msg = "The server's API key is not allowed to use this model."; }
  else if (s === 404) { code = "upstream_model"; msg = "The configured model was not found for this key."; }
  else if (s === 400 && /workspace/i.test(raw)) { code = "upstream_workspace"; msg = "The server's API key is not tied to a workspace."; }
  else if (s === 400) { code = "upstream_bad_request"; msg = "The model service rejected the request."; }
  else if (s === 429) { code = "upstream_rate"; msg = "The model service is rate limiting this key."; }
  else if (s >= 500 || s === 529) { code = "upstream_busy"; msg = "The model service is busy or unavailable."; }
  else if (!s) { code = "upstream_unreachable"; msg = "The server could not reach the model service."; }
  const err = new ApiError(502, code, msg);
  if (env.DEBUG_ERRORS === "1") err.detail = raw;
  return err;
}

/* ---------- model transport ---------- */
function makeAnthropicAsk(env) {
  let client, Anthropic;
  const model = env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const toBlocks = system => system.map(b => b.cache ? { type: "text", text: b.text, cache_control: { type: "ephemeral" } } : { type: "text", text: b.text });

  async function ask({ system, user, schema, effort, kind }) {
    if (!env.ANTHROPIC_API_KEY) throw new ApiError(503, "not_configured", "The server has no ANTHROPIC_API_KEY.");
    if (!client) {
      const mod = require("@anthropic-ai/sdk");
      Anthropic = mod.default || mod;
      /* a key that is not scoped to a workspace must say which workspace to use */
      const defaultHeaders = env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": String(env.ANTHROPIC_WORKSPACE_ID).trim() } : undefined;
      client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 55000, defaultHeaders });
    }
    const base = {
      model, max_tokens: kind === "answer" ? 4000 : 2500,
      system: toBlocks(system),
      messages: [{ role: "user", content: user }],
      output_config: { effort, format: { type: "json_schema", schema } }
    };
    let res;
    try {
      /* refusal fallback is on by default for the models that support it; if the API rejects it, retry once without */
      res = FALLBACK_MODELS.has(model)
        ? await client.beta.messages.create({ ...base, betas: [FALLBACK_BETA], fallbacks: "default" })
        : await client.messages.create(base);
    } catch (e) {
      if (FALLBACK_MODELS.has(model) && e instanceof Anthropic.BadRequestError && /fallback|beta/i.test(String(e.message))) {
        res = await client.messages.create(base);
      } else throw e;
    }
    if (res.stop_reason === "refusal") throw new ApiError(422, "refused", "The model declined this request.");
    if (res.stop_reason === "max_tokens") throw new ApiError(502, "truncated", "The reply was cut short.");
    const block = res.content.find(b => b.type === "text");
    if (!block) throw new ApiError(502, "empty", "The model returned no text.");
    try { return JSON.parse(block.text); } catch (e) { throw new ApiError(502, "invalid_json", "The model reply was not valid JSON."); }
  }
  return async args => { try { return await ask(args); } catch (e) { throw translateUpstream(e, env); } };
}

/* ---------- progress tokens ---------- */
function progressSecret(env) {
  if (env.PROGRESS_SECRET) return env.PROGRESS_SECRET;
  if (env.ANTHROPIC_API_KEY) return crypto.createHash("sha256").update("progress:" + env.ANTHROPIC_API_KEY).digest("hex");
  return progressSecret.fallback || (progressSecret.fallback = crypto.randomBytes(32).toString("hex"));
}
const canon = vars => JSON.stringify(Object.keys(vars || {}).sort().map(k => [k, vars[k]]));
function sign(secret, caseId, stage, vars) {
  return crypto.createHmac("sha256", secret).update(`${caseId}|${stage}|${canon(vars)}`).digest("hex");
}
function verify(secret, caseId, stage, vars, token) {
  const want = Buffer.from(sign(secret, caseId, stage, vars)), got = Buffer.from(String(token || ""));
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

/* ---------- handler ---------- */
function createHandler({ ask, env = process.env, now = Date.now } = {}) {
  const askFn = ask || makeAnthropicAsk(env);
  const facilitator = Facilitator.create({ cases, code, ask: askFn });
  const hits = new Map();
  const secret = progressSecret(env);
  const total = id => (cases.CASES.find(c => c.id === id) || { stages: [] }).stages.length;

  function limited(ip) {
    const t = now(), list = (hits.get(ip) || []).filter(x => t - x < RATE.windowMs);
    if (list.length >= RATE.max) { hits.set(ip, list); return true; }
    list.push(t); hits.set(ip, list);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(x => t - x < RATE.windowMs)) hits.delete(k);
    return false;
  }
  function codeOk(req) {
    if (!env.ACCESS_CODE) return true;
    const given = Buffer.from(String(req.headers["x-access-code"] || ""));
    const want = Buffer.from(String(env.ACCESS_CODE));
    return given.length === want.length && crypto.timingSafeEqual(given, want);
  }

  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const send = (status, body) => res.status(status).json(body);
    try {
      if (req.method !== "POST") return send(405, { error: "method_not_allowed" });
      let body = req.body;
      if (typeof body === "string") { if (body.length > MAX_BODY_CHARS) throw new ApiError(413, "too_large"); body = JSON.parse(body); }
      if (!body || typeof body !== "object" || JSON.stringify(body).length > MAX_BODY_CHARS) throw new ApiError(400, "bad_request", "Invalid request body.");
      const op = String(body.op || "");

      if (op === "ping") return send(200, { ok: true, configured: !!(env.ANTHROPIC_API_KEY), codeRequired: !!env.ACCESS_CODE });
      if (!codeOk(req)) throw new ApiError(401, "access_code_required", "An access code is required.");

      if (MODEL_OPS.has(op)) {
        const ip = String((req.headers["x-forwarded-for"] || "").split(",")[0].trim() || (req.socket && req.socket.remoteAddress) || "unknown");
        if (limited(ip)) throw new ApiError(429, "rate_limited", "Too many requests. Please wait a few minutes.");
      }

      const idx = Number.isInteger(body.stage) ? body.stage : -1;
      const caseId = String(body.caseId);

      /* stage, answer and reflect only work for a stage the participant has reached */
      let vars = body.vars;
      if (op === "stage" || op === "answer" || op === "reflect") {
        if (idx === 0) vars = {};
        else if (!verify(secret, caseId, idx, vars, body.token)) throw new ApiError(403, "stage_locked", "Answer the earlier stages to unlock this one.");
      }
      /* the signed token for the next stage is minted only when an answer to this stage is assessed */
      const withNext = r => {
        if (r.kind === "assess" && idx + 1 < total(caseId)) r.next = { stage: idx + 1, vars: r.nextVars, token: sign(secret, caseId, idx + 1, r.nextVars) };
        return r;
      };
      switch (op) {
        case "selftest": { /* one tiny model call: confirms the key, the model name and the request shape */
          const r = await askFn({ system: [{ type: "text", text: "Reply with the JSON object {\"ok\": true}." }], user: "ping", kind: "selftest", effort: "low",
            schema: { type: "object", additionalProperties: false, required: ["ok"], properties: { ok: { type: "boolean" } } } });
          return send(200, { ok: !!r && typeof r === "object", model: env.ANTHROPIC_MODEL || DEFAULT_MODEL });
        }
        case "cases": return send(200, { cases: facilitator.listCases(), topics: facilitator.topics() });
        case "stage": return send(200, facilitator.getStage({ caseId, stage: idx, vars }));
        case "answer": return send(200, withNext(await facilitator.answer({ caseId, stage: idx, vars, answer: body.answer, facts: body.facts, turns: body.turns, clarifyCount: body.clarifyCount })));
        case "reflect": return send(200, await facilitator.reflect({ caseId, stage: idx, vars, text: body.text, facts: body.facts, assessment: body.assessment, count: body.count }));
        case "debrief": return send(200, await facilitator.debrief({ caseId, picks: body.picks, notes: body.notes, principles: body.principles }));
        default: throw new ApiError(400, "bad_request", "Unknown operation.");
      }
    } catch (e) {
      const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 500;
      if (status >= 500 && !(e instanceof ApiError)) console.error("facilitate error:", e && e.stack || e);
      const error = e.error || (status === 429 ? "rate_limited" : status === 401 ? "upstream_auth" : status >= 500 ? "server_error" : "bad_request");
      const body = { error, message: e instanceof ApiError || status < 500 ? e.message : "The facilitator ran into a problem. Please try again." };
      if (e.detail) body.detail = e.detail;
      return res.status(status).json(body);
    }
  };
}

let shared;
module.exports = (req, res) => (shared || (shared = createHandler()))(req, res);
module.exports.createHandler = createHandler;
module.exports.sign = sign;
module.exports.translateUpstream = translateUpstream;
module.exports.progressSecret = progressSecret;
