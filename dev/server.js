/* Local dev server: serves the static site and mounts /api/facilitate.
   `npm run dev` uses the real model (needs ANTHROPIC_API_KEY in .env or the environment).
   `npm run dev:mock` (MOCK=1) uses the deterministic mock, no key needed. */
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const pub = path.join(root, "public");   // only this folder is static; server/ and api/ are never served

try { /* minimal .env loader */
  for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch (e) { /* no .env */ }

const mock = process.env.MOCK === "1";
const { createHandler } = require("../api/facilitate.js");
const handler = mock ? createHandler({ ask: require("./mock-model.js"), env: { ...process.env, ANTHROPIC_API_KEY: "mock" } }) : require("../api/facilitate.js");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json" };
const port = Number(process.env.PORT) || 3000;

http.createServer((req, res) => {
  if (req.url.split("?")[0] === "/api/facilitate") {
    let raw = ""; req.on("data", c => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on("end", () => {
      try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = null; }
      res.status = c => { res.statusCode = c; return res; };
      res.json = o => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
      handler(req, res);
    });
    return;
  }
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(pub, path.normalize(p));
  if (!f.startsWith(pub + path.sep)) { res.statusCode = 404; return res.end("Not found"); }
  fs.readFile(f, (err, data) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", TYPES[path.extname(f)] || "application/octet-stream"); res.end(data);
  });
}).listen(port, () => console.log(`http://localhost:${port}  (${mock ? "mock model" : "live model"})`));
