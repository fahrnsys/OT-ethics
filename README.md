# OT Ethics Case Facilitator

A chatbot that walks occupational therapy practitioners through ethics cases a piece at a time. It reveals more of the case based on what the participant says, and every judgment is bounded to the AOTA 2025 Occupational Therapy Code of Ethics.

The participant answers in their own words. A model probes, then judges the answer against the Code. The cases live on the server and are released one stage at a time.

## How the live facilitator stays inside the Code
- The Principles, Core Values, and Standards of Conduct are loaded verbatim (`code.js`) and are the only authority the model is given. Rules in the system prompt forbid citing anything else (HIPAA, CMS, NBCOT, state law).
- Every citation is checked against the loaded Code. Unknown ids are dropped, sentences that cite an unknown standard are removed, and the wording shown for each citation comes from `code.js`, never from the model.
- Each stage has authored reference responses (`cases.js`). When an answer matches one, the authored verdict, anchors, consequence, and case variables are used, so live play stays consistent across answers. Otherwise the model judges against the Code and writes one grounded consequence.
- The facilitator asks at most two clarifying questions per stage before it must judge. A vague answer gets a question, not a verdict.
- Where a decision turns on law, payer rules, capacity, or policy, the reply carries a "Beyond the Code" note that sends the participant to compliance, the state board, counsel, an ethics committee, or the AOTA Ethics Commission.
- Participant text is passed to the model as quoted data, never as instructions.

## Files
- `public/`: the only folder served as static files (`index.html`, `live.js`, `style.css`, `code.js`, `facilitator.js`). None of it contains case text.
- `server/cases.js`: the case library. Server-only; never served.
- `api/facilitate.js`: Vercel function. Holds the API key, releases one stage at a time against a signed progress token, rate limits, optional access code.
- `public/facilitator.js`: shared core (prompts, schema, validation). Runs on the server and, in a Claude artifact, in the browser.
- `dev/`: local server and a deterministic mock model; `test/`: tests

## How the case stays hidden
- Only `public/` is served (`outputDirectory` in `vercel.json`). `server/cases.js` and `api/` are not reachable by URL.
- Stage 1 is open. Stage N is released only with a token the server signed when the participant's answer to stage N-1 was assessed. The token covers the case, the stage, and the case variables, so it cannot be reused for another stage, another case, or with edited variables. Calling the API out of order returns 403.
- A participant can still read what the facilitator tells them, and can replay a stage they have reached.

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
   - `PROGRESS_SECRET` (optional; signs stage tokens; defaults to a key derived from `ANTHROPIC_API_KEY`. If the key is rotated, in-progress cases must be restarted.)
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
- In the Claude artifact preview, the page runs the facilitator in the browser, so that private page includes `cases.js`. Do not share that link with participants if the case text must stay hidden.
- The rate limit is in memory per server instance, so it is a speed bump, not a hard cap. Use a spend limit on the key as the real one.
- This is training material, not legal or clinical advice. Have an OT educator review the cases before use.
