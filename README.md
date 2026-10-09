# OT Ethics Chatbot

A chatbot that presents occupational therapy ethics cases a piece at a time, reveals more of the case based on the participant's responses, and keeps all feedback bounded to the AOTA 2025 Occupational Therapy Code of Ethics.

## Status
Scripted demo. `index.html` is a static, self-contained page with one sample case ("Home by Thursday"). It makes no API calls.

## Run
Open `index.html` in a browser, or deploy the folder as a static site (Vercel, GitHub Pages, etc.).

## Next
- Live version: free-text answers, an LLM that decides what to reveal next, with the Code as its only reference, behind a server route so the API key stays off the page.
- More cases, stored as data.
