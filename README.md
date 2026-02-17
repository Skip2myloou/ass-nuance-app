# Nuance Coach MVP

AI assistant for autistic adults to interpret dating messages and propose safe reply options.

## Prerequisites

- **Docker** (recommended) — or Python 3.11+ for local dev
- **Node.js 20+** (frontend)
- An **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com/))

---

## Quick Start (full stack — one command)

```bash
# 1. Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env → set ANTHROPIC_API_KEY=sk-ant-...

# 2. Start everything
docker compose up --build
```

That's it. Docker builds both containers, waits for the backend health check, then starts the frontend.

| Service  | URL                           |
|----------|-------------------------------|
| Frontend | http://localhost:3000          |
| Backend  | http://localhost:8000          |
| API docs | http://localhost:8000/docs     |

```bash
docker compose up --build -d   # background mode
docker compose logs -f          # tail logs
docker compose down             # stop everything
```

---

## Test the MVP

1. Open **http://localhost:3000** — you see two buttons
2. Click **"Begrijp bericht"**
3. Click one of the example chips, e.g. *"Haha ja hoor, tuurlijk 😉"* — it fills the textarea
4. Click **"Analyseer"** — wait a few seconds for Claude to respond
5. You see: literal summary, tone tags, possible meanings with confidence bars
6. Under "Wat kun je doen?" click **"Reageer"** — this takes you to `/reply` with the message prefilled
7. Reply options appear automatically (direct / warm / speels)
8. Click **"Kopieer"** on any reply to copy it
9. Try the refinement buttons: **"Minder direct"**, **"Warmer"**, **"Neutraler"**

All output is in Dutch by default (matches Dutch input).

---

## Run services individually (without Docker)

### Backend

```bash
cd backend
make install                   # creates .venv, installs deps
cp .env.example .env           # then set ANTHROPIC_API_KEY
make dev                       # uvicorn on :8000 with reload
```

Override Python version: `make install PYTHON=python3.11`

API: **http://localhost:8000** · Docs: **http://localhost:8000/docs**

```bash
curl http://localhost:8000/health   # → {"status":"ok"}
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App: **http://localhost:3000**

---

## API Endpoints

| Method | Path            | Description                                      |
|--------|-----------------|--------------------------------------------------|
| GET    | /health         | Health check                                     |
| POST   | /api/interpret  | Analyse a message — meanings, tone, next steps   |
| POST   | /api/replies    | Generate reply options given a message and goal   |

### POST /api/interpret

```json
// Request
{ "text": "Haha ja hoor, tuurlijk 😉" }

// Response
{
  "literal_summary": "...",
  "possible_meanings": [
    { "meaning": "...", "confidence": 85, "why": "..." }
  ],
  "tone_tags": ["playful", "sarcastic"],
  "suggested_actions": [
    { "action": "ask_clarifying_question", "why": "..." }
  ]
}
```

### POST /api/replies

```json
// Request
{ "text": "Haha ja hoor, tuurlijk 😉", "goal": "Vriendelijk reageren" }

// Response
{
  "options": [
    { "style": "direct",  "message": "...", "impact_label": "..." },
    { "style": "warm",    "message": "...", "impact_label": "..." },
    { "style": "playful", "message": "...", "impact_label": "..." }
  ]
}
```

## Makefile Commands

| Command        | Description                               |
|----------------|-------------------------------------------|
| `make install` | Create venv and install dependencies      |
| `make dev`     | Start uvicorn with auto-reload on :8000   |
| `make test`    | Run pytest                                |
