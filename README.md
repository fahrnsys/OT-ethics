# OT Ethics Case Facilitator

A chatbot that walks occupational therapy practitioners through ethics cases a piece at a time. It reveals more of the case based on what the participant says, and every judgment is bounded to the AOTA 2025 Occupational Therapy Code of Ethics.

Two versions share the same five cases:

| Version | Page | How it works | Needs |
|---|---|---|---|
| **Live** | `index.html` | The participant answers in their own words. A model probes, then judges the answer against the Code. | `ANTHROPIC_API_KEY` on the server |
| **Scripted** | `scripted.html` | Fixed answer options with authored feedback. | Nothing (static files) |

If the live version is unavailable (no key, no network), it links to the scripted one.

## How the live facilitator stays inside the Code
- The Principles, Core Values, and Standards of Conduct are loaded verbatim (`code.js`) and are the only authority the model is given. Rules in the system prompt forbid citing anything else (HIPAA, CMS, NBCOT, state law).
- Every citation is checked against the loaded Code. Unknown ids are dropped, sentences that cite an unknown standard are removed, and the wording shown for each citation comes from `code.js`, never from the model.
- Each stage has authored reference responses (`cases.js`). When an answer matches one, the authored verdict, anchors, consequence, and case variables are used, so live play stays consistent with the scripted cases. Otherwise the model judges against the Code and writes one grounded consequence.
- The facilitator asks at most two clarifying questions per stage before it must judge. A vague answer gets a question, not a verdict.
- Where a decision turns on law, payer rules, capacity, or policy, the reply carries a "Beyond the Code" note that sends the participant to compliance, the state board, counsel, an ethics committee, or the AOTA Ethics Commission.
- Participant text is passed to the model as quoted data, never as instructions.

## Files
- `index.html`, `live.js`, `style.css`: live UI
- `facilitator.js`: shared core (prompts, schema, validation). Runs on the server and in the browser.
- `api/facilitate.js`: Vercel function. Holds the API key, serves one stage at a time, rate limits, optional access code.
- `code.js`, `cases.js`: the Code and the case library (data)
- `scripted.html`, `app.js`: scripted version
- `dev/`: local server and a deterministic mock model; `test/`: tests

## Run locally
```
npm install
cp .env.example .env     # add ANTHROPIC_API_KEY
npm run dev              # http://localhost:3000, live model
npm run dev:mock         # no key needed, deterministic mock model
npm test
```

## Deploy (Vercel)
1. Import the repo. Framework preset **Other**, no build command.
2. Settings > Environment Variables:
   - `ANTHROPIC_API_KEY` (required)
   - `ANTHROPIC_MODEL` (optional, default `claude-opus-5-5`)
   - `ACCESS_CODE` (optional but recommended for a public URL; visitors must enter it before the facilitator answers)
3. Redeploy so the variables take effect.

Never put the key in the repo or the page. It is read only in `api/facilitate.js` from the environment.

## Cost and abuse controls
- Each live turn is one model call (`answer`, `reflect`, or `debrief`). Stage text is served without a model call. The Code is sent as a cached system block. A full case is on the order of a dozen calls.
- The route limits requests per client (40 per 10 minutes, in memory per instance), caps answer length, and sends no CORS headers. Set a monthly spend limit on the key in the Anthropic Console.
- To lower cost, set `ANTHROPIC_MODEL` to a smaller model.

## Cases
| Case | Setting | Scenarios linked |
|---|---|---|
| Home by Thursday | Home health | privacy, client vs. caregiver, consent, payer frequency, falsified documentation |
| Mateo Won't Come In | Outpatient pediatrics | child refusal, trauma-informed care, consent and assent, carryover, payer frequency, PRN skill match |
| The Census Dip | Skilled nursing | productivity, group/concurrent billing, baseline adjustment, insurance equity, maintenance therapy, retaliation |
| The Float Pool | Inpatient rehab | PRN skill match, goals met, staffing stewardship, competency, licensure and board reporting |
| Fieldwork Friday | SNF and outpatient | fieldwork supervision and billing, HIPAA, group billing, honest student evaluation |

Add a case by adding an object to `CASES` in `cases.js`. Each option cites only anchors that exist in `code.js` (`"4G"`, `"CV:Truth"`); `npm test` fails if one does not.

## Limits worth knowing
- `scripted.html` and `cases.js` are public static files, so the full case text, including later stages, can be read by anyone who looks. The live version serves one stage at a time, but it does not protect the case text from a participant who opens `cases.js`. To protect it, remove `scripted.html` and `app.js` and move `cases.js` under a server-only path.
- This is training material, not legal or clinical advice. Have an OT educator review the cases before use.
