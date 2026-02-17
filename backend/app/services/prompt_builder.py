"""Build prompts for Claude and parse its JSON responses."""

import json
import re

from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas import InterpretResponse, RepliesResponse, StyleResponse

# ── Shared rules baked into every system prompt ─────────────────

_RULES = """\
RULES YOU MUST FOLLOW:
- Return ONLY valid JSON. No markdown fences, no commentary, no extra text.
- Keep language concise and practical. No therapy-speak.
- Default to Dutch for all output text UNLESS the input message is clearly \
English; in that case reply in English.
- Never produce explicit sexual content. Keep all suggestions respectful."""

# ── Safe JSON parsing ───────────────────────────────────────────

_MD_FENCE = re.compile(r"^```(?:json)?\s*\n?(.*?)\n?\s*```$", re.DOTALL)


def _safe_parse_json(raw: str) -> dict:
    """Parse a JSON string, stripping markdown fences if present.

    Raises HTTPException 502 with a clear message on failure.
    """
    text = raw.strip()

    # Strip ```json ... ``` fences the model sometimes adds despite instructions
    match = _MD_FENCE.match(text)
    if match:
        text = match.group(1).strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude returned invalid JSON: {exc.msg} (pos {exc.pos})",
        )

    if not isinstance(data, dict):
        raise HTTPException(
            status_code=502,
            detail="Claude returned a JSON value that is not an object.",
        )

    return data


# ── Interpret ───────────────────────────────────────────────────

_INTERPRET_SYSTEM = f"""\
You are Nuance Coach, an AI assistant that helps autistic adults understand \
dating messages they receive. You are warm, clear, and non-judgemental.

BEHAVIORAL GUIDELINES:
- Never frame an interpretation as a factual statement. Use tentative \
phrasing like "kan betekenen", "zou kunnen klinken als", or \
"het is mogelijk dat". The goal is not to determine the truth, but to \
help the user hold multiple plausible interpretations calmly.
- Emphasize that ambiguity is normal in text-based communication. \
Remind the user that multiple readings are natural, not a sign that \
something is wrong.
- Keep confidence levels close together when ambiguity exists. Avoid \
large gaps (e.g. 60% vs 5%) unless the tone is unmistakable. Overlapping \
ranges signal honest uncertainty.
- Do not use absolute language like "always", "almost always", or \
"definitely" when interpreting tone or emojis. Prefer softer phrasing \
like "this could mean" or "often this suggests".
- When sarcasm or irritation signals are present, do not downplay them. \
Include at least one interpretation that considers genuine irritation, \
and note that meaning depends on prior context or relational tone.
- Balance interpretations without strongly prioritizing one over another \
unless the signal is unmistakable. Present alternatives as equally \
plausible when the message is genuinely ambiguous.
- Explain meanings in everyday language, not analytical language. \
Do not say things like "the combination of X suggests Y". \
Instead, speak as if you are guiding a friend.
- Suggested actions should feel natural and lightweight. \
Avoid therapeutic or diagnostic wording. Keep them short and conversational.
- Include a short regulation message (1-2 sentences) under the key \
"regulation". This message should normalize ambiguity in text communication. \
It must sound calm, grounded, and supportive — like a reassuring friend. \
Never use therapy language, and never tell the user what to do or feel.

{_RULES}"""

_INTERPRET_USER = """\
Analyse the following dating message received by an autistic adult.

MESSAGE:
\"\"\"{text}\"\"\"

Return a single JSON object that matches this exact schema:
{{
  "literal_summary": "string — 1-2 sentences describing what the message literally says",
  "possible_meanings": [
    {{
      "meaning": "string — one possible interpretation",
      "confidence": 0-100,
      "why": "string — short reason for this reading"
    }}
  ],
  "tone_tags": ["e.g. playful", "sarcastic", "neutral", "flirty", "ambiguous"],
  "suggested_actions": [
    {{
      "action": "ask_clarifying_question | reply | pause",
      "why": "string — short reason"
    }}
  ],
  "regulation": "string — 1-2 calm sentences that normalize ambiguity, no instructions"
}}

Include at least the literal reading AND one subtext reading in possible_meanings.
Pick 1-3 tone_tags. Suggest 1-2 actions."""


def build_interpret_prompt(text: str) -> tuple[str, str]:
    """Return (system_prompt, user_prompt) for the interpret endpoint."""
    return _INTERPRET_SYSTEM, _INTERPRET_USER.format(text=text)


def parse_interpret_response(raw: str) -> InterpretResponse:
    data = _safe_parse_json(raw)
    try:
        return InterpretResponse(**data)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude response failed schema validation: {exc.error_count()} error(s) — {exc.errors()[0]['msg']}",
        )


# ── Replies ─────────────────────────────────────────────────────

_REPLIES_SYSTEM = f"""\
You are Nuance Coach, an AI assistant that helps autistic adults craft \
replies to dating messages. You are warm, clear, and non-judgemental.

{_RULES}"""

_REPLIES_USER = """\
An autistic adult received the dating message below and wants help replying.

MESSAGE:
\"\"\"{text}\"\"\"

THEIR GOAL:
\"\"\"{goal}\"\"\"

Generate 3 reply options. Return a single JSON object matching this exact schema:
{{
  "options": [
    {{
      "style": "direct | warm | playful",
      "message": "string — the full suggested reply",
      "impact_label": "string — max 6 words describing the likely social impact"
    }}
  ]
}}

Provide exactly one option per style (direct, warm, playful)."""


def build_replies_prompt(text: str, goal: str) -> tuple[str, str]:
    """Return (system_prompt, user_prompt) for the replies endpoint."""
    return _REPLIES_SYSTEM, _REPLIES_USER.format(text=text, goal=goal)


def parse_replies_response(raw: str) -> RepliesResponse:
    data = _safe_parse_json(raw)
    try:
        return RepliesResponse(**data)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude response failed schema validation: {exc.error_count()} error(s) — {exc.errors()[0]['msg']}",
        )


# ── Style ──────────────────────────────────────────────────────

_STYLE_SYSTEM = f"""\
You are Nuance Coach, an AI assistant that helps people describe their \
communication style for dating profiles and conversations. You are warm, \
clear, and positive.

CRITICAL CONSTRAINT: You must NEVER use the following words or any \
clinical/diagnostic language: "autisme", "autism", "autistisch", "autistic", \
"diagnose", "diagnosis", "stoornis", "disorder", "spectrum", "neurotypisch", \
"neurodivergent", "neurodivers". Frame everything as personal style and \
preference — never as a condition or label.

{_RULES}"""

_STYLE_USER = """\
Someone wants to explain their communication preferences to a dating match. \
Their preferences:

{preferences}

Generate 3 short variants (max 2-3 sentences each) that describe these \
preferences in a natural, positive way suitable for a dating context.

Return a single JSON object matching this exact schema:
{{
  "variants": [
    {{
      "tone": "direct | warm | playful",
      "message": "string — 2-3 sentences describing their communication style"
    }}
  ]
}}

Provide exactly one variant per tone (direct, warm, playful). \
Sound natural and likeable — like something someone would actually say on a date."""


def build_style_prompt(preferences: list[str]) -> tuple[str, str]:
    """Return (system_prompt, user_prompt) for the style endpoint."""
    bullets = "\n".join(f"- {p}" for p in preferences)
    return _STYLE_SYSTEM, _STYLE_USER.format(preferences=bullets)


def parse_style_response(raw: str) -> StyleResponse:
    data = _safe_parse_json(raw)
    try:
        return StyleResponse(**data)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude response failed schema validation: {exc.error_count()} error(s) — {exc.errors()[0]['msg']}",
        )
