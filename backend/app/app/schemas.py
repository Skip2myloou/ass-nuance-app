from typing import Literal

from pydantic import BaseModel, Field


# ── /api/interpret ──────────────────────────────────────────────


class InterpretRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        strip_whitespace=True,
        examples=["Hey, wil je vanavond iets drinken? 😊"],
    )


class PossibleMeaning(BaseModel):
    meaning: str
    confidence: int = Field(..., ge=0, le=100)
    why: str


class SuggestedAction(BaseModel):
    action: Literal["ask_clarifying_question", "reply", "pause"]
    why: str


class InterpretResponse(BaseModel):
    literal_summary: str
    possible_meanings: list[PossibleMeaning]
    tone_tags: list[str]
    suggested_actions: list[SuggestedAction]
    regulation: str


# ── /api/replies ────────────────────────────────────────────────


class RepliesRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        strip_whitespace=True,
        examples=["Hey, wil je vanavond iets drinken? 😊"],
    )
    goal: str = Field(
        ...,
        min_length=1,
        max_length=500,
        strip_whitespace=True,
        examples=["Ik wil vriendelijk reageren maar nog geen afspraak maken"],
    )


class ReplyOption(BaseModel):
    style: Literal["direct", "warm", "playful"]
    message: str
    impact_label: str = Field(..., max_length=50)


class RepliesResponse(BaseModel):
    options: list[ReplyOption]


# ── /api/style ─────────────────────────────────────────────────


class StyleRequest(BaseModel):
    preferences: list[str] = Field(
        ...,
        min_length=1,
        max_length=10,
        examples=[["Duidelijke vragen met opties", "Expliciete intenties"]],
    )


class StyleVariant(BaseModel):
    tone: Literal["direct", "warm", "playful"]
    message: str


class StyleResponse(BaseModel):
    variants: list[StyleVariant]
