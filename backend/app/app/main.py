from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    InterpretRequest,
    InterpretResponse,
    RepliesRequest,
    RepliesResponse,
    StyleRequest,
    StyleResponse,
)
from app.services.claude import call_claude
from app.services.prompt_builder import (
    build_interpret_prompt,
    build_replies_prompt,
    build_style_prompt,
    parse_interpret_response,
    parse_replies_response,
    parse_style_response,
)
from app.settings import get_settings

settings = get_settings()
print("ANTHROPIC KEY LOADED:", bool(settings.anthropic_api_key))
app = FastAPI(
    title="Nuance Coach API",
    version="0.1.0",
    description="AI assistant for interpreting dating messages and suggesting replies",
)

@app.get("/")
def root():
    return {"status": "API is running"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: add rate limiting middleware (e.g. slowapi) — cap per-IP to ~20 req/min


# ── Health ──────────────────────────────────────────────────────


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# ── Interpret ───────────────────────────────────────────────────
# TODO: rate-limit this endpoint separately (~10 req/min per user)


@app.post("/api/interpret", response_model=InterpretResponse)
async def interpret_message(req: InterpretRequest):
    """Analyse a dating message: literal summary, possible meanings, tone, next steps."""
    system_prompt, user_prompt = build_interpret_prompt(req.text)
    raw = await call_claude(system_prompt, user_prompt)
    return parse_interpret_response(raw)


# ── Replies ─────────────────────────────────────────────────────
# TODO: rate-limit this endpoint separately (~10 req/min per user)


@app.post("/api/replies", response_model=RepliesResponse)
async def suggest_replies(req: RepliesRequest):
    """Generate safe reply options given a dating message and the user's goal."""
    system_prompt, user_prompt = build_replies_prompt(req.text, req.goal)
    raw = await call_claude(system_prompt, user_prompt)
    return parse_replies_response(raw)


# ── Style ──────────────────────────────────────────────────────


@app.post("/api/style", response_model=StyleResponse)
async def generate_style(req: StyleRequest):
    """Generate a natural explanation of communication preferences."""
    system_prompt, user_prompt = build_style_prompt(req.preferences)
    raw = await call_claude(system_prompt, user_prompt)
    return parse_style_response(raw)
