# OT Ethics Case Facilitator

A chatbot that presents occupational therapy ethics cases a piece at a time, reveals more of the case based on the participant's responses, and keeps all feedback bounded to the AOTA 2025 Occupational Therapy Code of Ethics.

## Status
Scripted demo. Static files, no build step, no API calls.

- `index.html`: page shell and styles
- `app.js`: facilitator engine (case library, staged reveal, Code lookup, debrief)
- `code.js`: Principles, Core Values, and Standards of Conduct, quoted from the 2025 Code
- `cases.js`: the case library (data)

## Cases
| Case | Setting | Scenarios linked |
|---|---|---|
| Home by Thursday | Home health | privacy, client vs. caregiver, consent, payer frequency, falsified documentation |
| Mateo Won't Come In | Outpatient pediatrics | child refusal, trauma-informed care, consent and assent, carryover, payer frequency, PRN skill match |
| The Census Dip | Skilled nursing | productivity, group/concurrent billing, baseline adjustment, insurance equity, maintenance therapy, retaliation |
| The Float Pool | Inpatient rehab | PRN skill match, goals met, staffing stewardship, competency, licensure and board reporting |
| Fieldwork Friday | SNF and outpatient | fieldwork supervision and billing, HIPAA, group billing, honest student evaluation |

Each stage lists the scenario topics it covers, so one scenario can appear in several cases. The library shows where each one appears.

## Adding a case
Add an object to `CASES` in `cases.js`. Each option cites only anchors that exist in `code.js` (`"4G"` for a Standard, `"CV:Truth"` for a Core Value). Where a decision turns on law, payer rules, or policy, set `beyond` so the facilitator says where the Code stops.

## Run
Open `index.html` in a browser, or deploy the folder as a static site (Vercel: framework preset "Other", no build command).

## Next
Live version: free-text answers, an LLM that decides what to reveal next with the Code as its only reference, behind a server route so the API key stays off the page.
