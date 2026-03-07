from app.schemas import (
    InterpretRequest,
    InterpretResponse,
    LensResult,
    MessageInput,
    RealityCheckRequest,
    RealityCheckResult,
    RefineRequest,
    RefineResponse,
    RepliesRequest,
    RepliesResponse,
    StyleRequest,
    StyleResponse,
)
from app.services.lenslab import analyze
from app.services.reality_check import get_reality_check
from app.services.claude import call_claude
from app.services.prompt_builder import (
    build_interpret_prompt,
    build_refine_prompt,
    build_replies_prompt,
    build_style_prompt,
    parse_interpret_response,
    parse_refine_response,
    parse_replies_response,
    parse_style_response,
)
from app.settings import get_settings
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

settings = get_settings()
print("ANTHROPIC KEY LOADED:", bool(settings.anthropic_api_key))

# ── Rate limiter (30 req/min per IP across all AI endpoints) ────
limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])

app = FastAPI(
    title="LiteralPause API",
    version="0.1.0",
    description="AI assistant for interpreting dating messages and suggesting replies",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.api_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "API is running"}


# ── Health ──────────────────────────────────────────────────────


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# ── Interpret ───────────────────────────────────────────────────


@app.post("/api/interpret", response_model=InterpretResponse)
@limiter.limit("30/minute")
async def interpret_message(request: Request, req: InterpretRequest):
    system_prompt, user_prompt = build_interpret_prompt(req.text, req.state)
    raw = await call_claude(system_prompt, user_prompt)
    return parse_interpret_response(raw, req.state)


# ── Replies ─────────────────────────────────────────────────────


@app.post("/api/replies", response_model=RepliesResponse)
@limiter.limit("30/minute")
async def suggest_replies(request: Request, req: RepliesRequest):
    """Generate safe reply options given a dating message and the user's goal."""
    system_prompt, user_prompt = build_replies_prompt(req.text, req.goal)
    raw = await call_claude(system_prompt, user_prompt)
    return parse_replies_response(raw)


# ── Refine ─────────────────────────────────────────────────────


@app.post("/api/refine", response_model=RefineResponse)
@limiter.limit("30/minute")
async def refine_reply(request: Request, req: RefineRequest):
    """Refine the user's draft reply and return feedback + improved version."""
    system_prompt, user_prompt = build_refine_prompt(req.text, req.draft, req.goal)
    raw = await call_claude(system_prompt, user_prompt)
    return parse_refine_response(raw)


# ── Style ──────────────────────────────────────────────────────


@app.post("/api/style", response_model=StyleResponse)
@limiter.limit("30/minute")
async def generate_style(request: Request, req: StyleRequest):
    """Generate a natural explanation of communication preferences."""
    system_prompt, user_prompt = build_style_prompt(req.preferences)
    raw = await call_claude(system_prompt, user_prompt)
    return parse_style_response(raw)


# ── LensLab ─────────────────────────────────────────────────────


@app.post("/lens/analyze", response_model=LensResult)
@limiter.limit("20/minute")
async def analyze_message(request: Request, body: MessageInput) -> LensResult:
    """Show a message through four cognitive lenses."""
    return await analyze(body.message)


@app.post("/lens/reality-check", response_model=RealityCheckResult)
@limiter.limit("20/minute")
async def reality_check(
    request: Request, body: RealityCheckRequest
) -> RealityCheckResult:
    """Generate three reality check questions based on lens readings."""
    readings_by_lens = {r.lens: r.reading for r in body.readings}
    return await get_reality_check(
        original=body.original,
        literal=readings_by_lens.get("Literal lens", ""),
        threat=readings_by_lens.get("Threat lens", ""),
        social=readings_by_lens.get("Social reading lens", ""),
        romantic=readings_by_lens.get("Romantic lens", ""),
    )
