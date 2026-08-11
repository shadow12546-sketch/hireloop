# Shivam's AI Module — Resume Parsing (Step 1)

## What this does
Takes an uploaded resume (PDF or DOCX), extracts the raw text, sends it to
Groq's LLM with a structured prompt, and returns clean JSON that can auto-fill
a candidate's profile.

## Files
- `utils/extractText.js` — pulls raw text out of PDF/DOCX files
- `utils/llmClient.js` — wraps the Groq API call, always returns parsed JSON
- `routes/ai.js` — the actual Express route: `POST /api/ai/resume/parse`

## How to install (run inside your /backend folder)
```
npm install groq-sdk pdf-parse mammoth express
```

## How to wire it into your Express app
1. Copy `utils/extractText.js` and `utils/llmClient.js` into `/backend/utils/`
2. Copy `routes/ai.js` into `/backend/routes/`
3. In your main server file (e.g. `server.js` or `app.js`), add:
```js
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);
```
4. Make sure `.env` has `GROQ_API_KEY=your_key_here`
5. Make sure `.env` is loaded at the top of your server file:
```js
require("dotenv").config();
```
Also run `npm install dotenv` if it's not already a dependency.

## How to test it (once wired in)
Send a POST request to `http://localhost:5000/api/ai/resume/parse` with:
```json
{
  "filePath": "path/to/a/resume.pdf",
  "mimeType": "application/pdf"
}
```
You can test this with Postman, curl, or Thunder Client in VS Code.

Note: this assumes the file is already saved to disk somewhere (e.g. by
Muskan's upload endpoint using multer). Adjust `filePath` to match wherever
uploaded resumes actually land once her upload endpoint exists — coordinate
with her on the exact folder path or storage approach (local disk vs S3).

## What happens if the AI call fails
The route catches any error and returns a valid (empty) JSON object with a
`_fallback: true` flag instead of crashing — so the candidate's upload flow
never breaks even if Groq is down or rate-limited. Sachin's frontend should
check for `_fallback` and show a "please fill manually" message if present.

## Next steps (in order)
1. Test this parsing endpoint with 2-3 real sample resumes
2. Build `/api/ai/resume/match` (resume vs job description scoring) — same
   pattern: extract data → build prompt → call `callLLMForJSON()`
3. Build `/api/ai/assessment/auto-assign`
4. Build `/api/ai/interview/session`
