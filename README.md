# AI Podcast Generator — Cursor Plan (MVP)

## Goal
Input (URL/text) → LLM outline → script → TTS → stitch → single MP3 (3–10 min). Web-first demo.

## Tech
- Frontend: Next.js (App Router, TS)
- Backend: Node + Express (TS)
- LLM: OpenAI (or Claude) for outline+script
- TTS: ElevenLabs or OpenAI TTS
- Audio: ffmpeg to stitch MP3
- Storage: local `/storage` → later S3

## Repo
ai-podcast-generator/
  frontend/ (Next.js)
  backend/
    src/
      index.ts
      routes/generate.ts
      services/ingest.ts
      services/llm.ts
      services/tts.ts
      services/audio.ts
      utils/text.ts
    storage/           # mp3 output
    .env.example

## Env (backend)
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
PORT=4000

## Backend API (MVP)
POST /generate
Body:
{
  "input": "string",
  "inputType": "url" | "text",
  "voice": "optional",
  "style": "optional"
}
Steps:
1) ingest → clean text
2) outline → script (LLM)
3) TTS chunks → wav
4) stitch → MP3 (ffmpeg)
5) save /storage/<id>.mp3 → return { id, url, duration, size }

## Frontend Flow
- Form: URL/Text toggle, input, voice/style selects, Generate
- Show status: Ingesting → Writing → Synthesizing → Stitching
- On success: <audio controls src="..."> + Download

## Definition of Done
- Paste → Generate → Play/Download MP3
- Handles empty/bad URL
- `npm run dev` works for both apps

---

## Cursor “Do This” Tasks (run sequentially)

### 1) Scaffold monorepo
Create a root folder **ai-podcast-generator** with:
- **frontend**: Next.js (TypeScript, App Router)
- **backend**: Node + Express (TypeScript)
- Shared `.gitignore` and per-app `package.json`
Add root **README** with quickstart.

### 2) Backend skeleton
In **backend**:
- Install: express, dotenv, axios, openai, uuid, multer, mime, child_process, ffmpeg-static
- Dev/types: typescript, ts-node-dev, @types/express, @types/node
- Add **src/index.ts** with `/health` and mount `/generate`
- Add services:
  - **services/ingest.ts** (fetch & sanitize URL; pass-through for text)
  - **services/llm.ts** (outline+script via OpenAI)
  - **services/tts.ts** (chunk script → TTS wav files)
  - **services/audio.ts** (ffmpeg concat → MP3)
  - **utils/text.ts** (split to ~1–2k chars per chunk)
- Expose `/storage` statically
- Scripts in package.json:
  - "dev": "ts-node-dev --respawn src/index.ts"
  - "build": "tsc"
  - "start": "node dist/index.js"
- Create `.env.example` (OPENAI_API_KEY, ELEVENLABS_API_KEY, PORT)

### 3) Implement /generate pipeline (stubs first)
Flow:
- Validate body
- `ingest(input, inputType)` → `rawText`
- `llm.generateScript(rawText)` → `script`
- `tts.synthesize(script, voice, style)` → `[wavPaths]`
- `audio.stitchToMp3(wavPaths)` → `mp3Path, duration, size`
- Return `{ id, url, duration, size }`
Add timing logs + try/catch with readable errors.

### 4) Frontend page
In **frontend**:
- Single page:
  - Toggle: URL/Text
  - Input field (textarea for text, input for URL)
  - Voice/style selects (hardcode 3–5 voices/styles)
  - Generate button → POST to backend
  - Status text
  - On success: audio player + Download button
- Dev uses `http://localhost:4000`

### 5) Local run
- backend: `npm run dev` (port 4000)
- frontend: `npm run dev` (port 3000)
- Test with a public article URL and a pasted paragraph.

### 6) Polish
- Include file size + duration in response
- Limit max input length; warn on overflow
- Add simple rate limit (e.g., 10/min/IP)
- Add `GET /episodes` to list saved MP3s

---

## Prompts (LLM)

### Outline → Script
You are a podcast scriptwriter. Summarize the provided source into a tight 3–10 minute script.
Constraints:
- Conversational, two-host style
- Clear structure: hook → 3–5 key insights → wrap-up with CTA
- Keep claims grounded; cite source names inline where possible
- Avoid fluff and repetition

Output format (JSON):
{
  "title": "...",
  "segments": [
    {"speaker":"Host A","text":"..."},
    {"speaker":"Host B","text":"..."}
  ]
}

### TTS Chunking
- Keep chunks ≤ ~1500 characters
- Break at sentence boundaries
- Ensure each chunk is self-contained (no mid-sentence cuts)

---

## Error Handling (MVP)
- Empty input → 400 with message
- URL fetch fail → 422 "Couldn’t fetch content"
- LLM/TTS error → 502 "Generation failed"
- Always log: step, ms elapsed, error.message

---

## Deployment (Week 3)
- Host on Railway/Fly.io
- S3 bucket for `/storage` (swap local → S3)
- Add basic auth + /episodes list per user
