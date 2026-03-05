"""Build prompts for Claude and parse its JSON responses."""

import json
import re
from pathlib import Path

from app.schemas import (
    InterpretResponse,
    RefineResponse,
    RepliesResponse,
    StyleResponse,
)
from fastapi import HTTPException
from pydantic import ValidationError

# ── External prompt loading ─────────────────────────────

PROMPTS_DIR = Path(__file__).resolve().parents[2] / "prompts"

# ── Shared rules baked into every system prompt ─────────────────

_RULES = """\
RULES YOU MUST FOLLOW:
- Return ONLY valid JSON. No markdown fences, no commentary, no extra text.
- Keep language concise and practical. No therapy-speak.
- Default to Dutch for all output text UNLESS the input message is clearly \
English; in that case reply in English.
- Never produce explicit sexual content. Keep all suggestions respectful."""


def load_prompt(filename: str) -> str:
    return (PROMPTS_DIR / filename).read_text()


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


# ── Interet system prompt ───────────────────────────────────────────────────

_INTERPRET_SYSTEM = f"""\
You are LiteralPause, an AI assistant that helps autistic adults understand \
dating messages they receive. You are warm, clear, and non-judgemental.

BEHAVIORAL GUIDELINES:
- Never frame an interpretation as a factual statement. Use tentative phrasing.
- Emphasize that ambiguity is normal in text-based communication.
- Keep confidence levels close together when ambiguity exists.
- Do not use absolute language.
- Include irritation possibilities when signals exist.
- Balance interpretations without strongly prioritizing one.
- Explain meanings in everyday language.
- Suggested actions should feel natural and lightweight.
- Include a short regulation message under "regulation".
- Never use therapy language.

LANGUAGE RULES - APPLY TO ALL OUTPUT TEXT:
- Write in concrete, direct language. Describe what literally happens.
- Do NOT use figurative expressions or idioms. Forbidden examples include:
  "deur op een kier", "houdt de deur open", "kat uit de boom kijken",
  "ijsbreker", "hart luchten", "ei kwijt", "de hand reiken",
  "ergens mee zitten", "een stapje terug doen", and similar.
- Instead of a figurative phrase, write what actually occurs:
  NOT "Ze houdt de deur op een kier."
  BUT "Ze geeft aan dat contact later nog mogelijk is."
- This rule applies to: the "meaning" field, the "why" field,
  the "regulation" field, and the confidence-bar label text.

{_RULES}
"""

# Append dating-specific logic
_INTERPRET_SYSTEM += "\n\n" + load_prompt("interpret_dating_agent.txt")

# ─ Interpret user prompt ───────────────────────────────────────$

_INTERPRET_USER = """\
Analyse the following dating message received by an autistic adult.

MESSAGE:
\"\"\"{text}\"\"\"

Return a single JSON object that matches this exact schema:
{{
  "literal_summary": "string (1-2 sentences describing what the message literally says)",
  "possible_meanings": [
    {{
      "meaning": "string (one possible interpretation)",
      "confidence": 0-100,
      "why": "string (short reason for this reading)"
    }}
  ],
  "tone_tags": ["e.g. playful", "sarcastic", "neutral", "flirty", "ambiguous"],
  "suggested_actions": [
    {{
      "action": "ask_clarifying_question | reply | pause",
      "why": "string (short reason)"
    }}
  ],
  "regulation": "string (1-2 calm sentences that normalize ambiguity)"
}}
Include at least one literal reading.
If ambiguity exists, include at least one plausible subtext reading."""


def build_interpret_prompt(text: str, state: str = "calm") -> tuple[str, str]:
    """Return (system_prompt, user_prompt) for the interpret endpoint."""

    state_guidance = ""

    if state == "tense":
        state_guidance = (
            "\nUSER_STATE: tense\n"
            "The user feels somewhat tense or doubtful. "
            "Increase normalization slightly. Avoid strong conclusions. "
            "Keep confidence levels closer together.\n"
        )
    elif state == "overstimulated":
        state_guidance = (
            "\nUSER_STATE: overstimulated\n"
            "The user feels overstimulated. "
            "Keep explanations shorter. Limit possible_meanings to maximum 2. "
            "Use very calm, grounded tone. Emphasize ambiguity as normal.\n"
        )
    else:
        state_guidance = "\nUSER_STATE: calm\nRespond normally.\n"

    system_prompt = _INTERPRET_SYSTEM + state_guidance
    user_prompt = _INTERPRET_USER.format(text=text)

    return system_prompt, user_prompt


def parse_interpret_response(raw: str, state: str = "calm") -> InterpretResponse:
    data = _safe_parse_json(raw)

    print("STATE IN PARSER:", state)

    # 🔹 Enforce calmer UX for overstimulated users
    if state == "overstimulated":
        # Limit to max 2 interpretations
        if "possible_meanings" in data:
            data["possible_meanings"] = data["possible_meanings"][:2]

        # Shorten regulation text slightly
        if "regulation" in data and isinstance(data["regulation"], str):
            sentences = data["regulation"].split(". ")
            data["regulation"] = ". ".join(sentences[:2]).strip()

    try:
        return InterpretResponse(**data)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude response failed schema validation: {exc.error_count()} error(s): {exc.errors()[0]['msg']}",
        )


# ── Replies ─────────────────────────────────────────────────────

_REPLIES_SYSTEM = f"""\
You are LiteralPause, an AI assistant that helps autistic adults craft \
replies to dating messages. You are warm, clear, and non-judgemental.

BEHAVIORAL GUIDELINES:
- Replies must feel natural and human.
- Avoid clichés, idioms, metaphors, or image-based language.
- Avoid phrases like "leave the ball in their court", "keep the door open",
  "weather the storm", or similar figurative language.
- Do not use abstract shorthand to describe social impact.

IMPACT_LABEL RULES:
- impact_label must describe the social effect in clear, literal language.
- It must explain who keeps initiative.
- It must mention whether pressure is reduced or created.
- It must avoid metaphors and vague expressions.
- It must be explicit and suitable for literal/autistic thinkers.
- Maximum 12 words.
- Must start with "You ..." or "This reply ..."

Examples of GOOD impact labels:
- "You respond kindly and reduce pressure."
- "You show interest and invite them to decide."
- "You express empathy without asking for more contact."

Examples of FORBIDDEN patterns:
- "Leaves the ball with them"
- "Keeps the door open"
- "Soft but firm"
- "Light and breezy"

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
      "message": "string (the full suggested reply)",
      "impact_label": "string (max 12 words, literal explanation of the social effect)"
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
            detail=f"Claude response failed schema validation: {exc.error_count()} error(s): {exc.errors()[0]['msg']}",
        )


# ── Refine ─────────────────────────────────────────────────────

_REFINE_SYSTEM = f"""\
You are LiteralPause, an AI assistant that helps autistic adults refine \
draft replies to dating messages. You are warm, constructive, and non-judgemental.

BEHAVIORAL GUIDELINES:
- Give short, kind, specific feedback. Never criticise tone or personality.
- Preserve the user's voice and intent. Only improve clarity and goal-alignment.
- If the draft is already good, say so and make only minor improvements.
- Never rewrite the draft into something unrecognisable.
- Avoid therapy-speak, abstract metaphors, or figurative language.

{_RULES}"""

_REFINE_USER = """\
An autistic adult received the dating message below and wrote a draft reply. \
Help them refine it so it better achieves their goal.

ORIGINAL MESSAGE:
\"\"\"{text}\"\"\"

THEIR GOAL:
\"\"\"{goal}\"\"\"

THEIR DRAFT REPLY:
\"\"\"{draft}\"\"\"

Return a single JSON object matching this exact schema:
{{
  "feedback": "string (1-3 sentences of kind, specific feedback on the draft)",
  "improved": "string (an improved version of the draft that better achieves the goal)"
}}"""


def build_refine_prompt(text: str, draft: str, goal: str) -> tuple[str, str]:
    """Return (system_prompt, user_prompt) for the refine endpoint."""
    return _REFINE_SYSTEM, _REFINE_USER.format(text=text, draft=draft, goal=goal)


def parse_refine_response(raw: str) -> RefineResponse:
    data = _safe_parse_json(raw)
    try:
        return RefineResponse(**data)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude response failed schema validation: {exc.error_count()} error(s): {exc.errors()[0]['msg']}",
        )


# ── Style ──────────────────────────────────────────────────────

_STYLE_SYSTEM = f"""\
You are LiteralPause, an AI assistant that helps people describe their \
communication style for dating profiles and conversations. You are warm, \
clear, and positive.

CRITICAL CONSTRAINT: You must NEVER use the following words or any \
clinical/diagnostic language: "autisme", "autism", "autistisch", "autistic", \
"diagnose", "diagnosis", "stoornis", "disorder", "spectrum", "neurotypisch", \
"neurodivergent", "neurodivers". Frame everything as personal style and \
preference, never as a condition or label.

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
      "message": "string (2-3 sentences describing their communication style)"
    }}
  ]
}}

Provide exactly one variant per tone (direct, warm, playful). \
Sound natural and likeable, like something someone would actually say on a date."""


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
            detail=f"Claude response failed schema validation: {exc.error_count()} error(s): {exc.errors()[0]['msg']}",
        )
