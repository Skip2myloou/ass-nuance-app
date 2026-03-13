from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

# ── /api/interpret ──────────────────────────────────────────────


class InterpretRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        strip_whitespace=True,
        examples=["Hey, wil je vanavond iets drinken? 😊"],
    )
    state: Literal["calm", "tense", "overstimulated"] = Field(
        default="calm",
        description="User's current regulation state before interpreting the message.",
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
    impact_label: str = Field(..., max_length=120)


class RepliesResponse(BaseModel):
    options: list[ReplyOption]


# ── /api/refine ─────────────────────────────────────────────────


class RefineRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        strip_whitespace=True,
        description="The original received message.",
    )
    draft: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        strip_whitespace=True,
        description="The user's draft reply to refine.",
    )
    goal: str = Field(
        ...,
        min_length=1,
        max_length=500,
        strip_whitespace=True,
        description="What the user wants to achieve with their reply.",
    )


class RefineResponse(BaseModel):
    feedback: str = Field(
        ..., description="Short, kind feedback on the draft (1-3 sentences)."
    )
    improved: str = Field(..., description="An improved version of the draft.")


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


# ── /lens/analyze ───────────────────────────────────────────────


class MessageInput(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Message too short to analyze")
        if len(v) > 500:
            raise ValueError("Message too long — max 500 characters")
        return v


class LensReading(BaseModel):
    lens: Literal[
        "Literal lens",
        "Threat lens",
        "Social reading lens",
        "Romantic lens",
    ]
    reading: str


class LensResult(BaseModel):
    readings: list[LensReading]


# ── /lens/reality-check ─────────────────────────────────────────


class RealityCheckQuestion(BaseModel):
    style: Literal["neutraal", "speels", "direct"]
    question: str


class RealityCheckResult(BaseModel):
    questions: list[RealityCheckQuestion]


class RealityCheckRequest(BaseModel):
    original: str
    readings: list[LensReading]


# ── /charge ─────────────────────────────────────────────────────


class ChargeLogEntry(BaseModel):
    date: str = Field(
        ...,
        description="ISO date string YYYY-MM-DD",
        examples=["2026-03-10"],
    )
    stress: int = Field(..., ge=1, le=10)
    social_count: int = Field(..., ge=0)
    social_intensity: Literal["licht", "gemiddeld", "zwaar"]
    planning: list[str] = Field(..., min_length=1)
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    sleep_quality: Optional[Literal["goed", "matig", "slecht"]] = None
    planning_tomorrow: Optional[list[str]] = None
    notes: Optional[str] = Field(default=None, max_length=500)


class ChargeLogResponse(BaseModel):
    saved: bool
    date: str


class ChargeHistoryResponse(BaseModel):
    entries: list[ChargeLogEntry]
    count: int


class ChargeTodayResponse(BaseModel):
    found: bool
    state: Optional[Literal["calm", "tense", "overstimulated"]] = None
    stress: Optional[int] = None


class ChargeVerdiepingEntry(BaseModel):
    date: str = Field(..., description="ISO date string YYYY-MM-DD", examples=["2026-03-13"])
    signalen_lichamelijk: list[str] = Field(default_factory=list)
    signalen_psychisch: list[str] = Field(default_factory=list)
    signalen_gedrag: list[str] = Field(default_factory=list)
    opladen: list[str] = Field(default_factory=list)


class ChargeVerdiepingResponse(BaseModel):
    saved: bool
    date: str


class ChargeVerdiepingGetResponse(BaseModel):
    found: bool
    entry: Optional[ChargeVerdiepingEntry] = None


def stress_to_state(stress: int) -> Literal["calm", "tense", "overstimulated"]:
    if stress <= 3:
        return "calm"
    elif stress <= 6:
        return "tense"
    else:
        return "overstimulated"
