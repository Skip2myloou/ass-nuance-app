"""
Charge — voorspellingslogica.
Stuurt history + planning naar Claude en parseert het resultaat.
"""

import json
from pathlib import Path

from app.services.claude import call_claude

from typing import Optional

from pydantic import BaseModel, Field


class ChargePredictRequest(BaseModel):
    days: int = Field(default=7, ge=1, le=30)
    planning_today: Optional[list[str]] = Field(default=None)


class ChargePredictResponse(BaseModel):
    percentage: int
    stem: str
    vooruitblik: str
    days_used: int


PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "charge.md"

MIN_DAYS = 3  # Minimum aantal dagen voor een betrouwbare voorspelling


class ChargeResult:
    def __init__(self, percentage: int, stem: str, vooruitblik: str):
        self.percentage = percentage
        self.stem = stem
        self.vooruitblik = vooruitblik


class InsufficientDataError(Exception):
    """Wordt gegooid als er te weinig history is voor een voorspelling."""

    pass


def _load_system_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def _format_entry(entry: dict) -> str:
    """Zet één log-entry om naar leesbare tekst voor de prompt."""
    lines = [f"Datum: {entry['date']}"]
    lines.append(f"Stress: {entry['stress']}/10")
    lines.append(
        f"Sociale contacten: {entry['social_count']} interacties, {entry['social_intensity']}"
    )
    planning = ", ".join(entry.get("planning") or [])
    if planning:
        lines.append(f"Planning die dag: {planning}")
    if entry.get("sleep_hours"):
        quality = entry.get("sleep_quality") or "onbekend"
        lines.append(f"Slaap: {entry['sleep_hours']} uur, kwaliteit: {quality}")
    if entry.get("notes"):
        lines.append(f"Notitie: {entry['notes']}")
    return "\n".join(lines)


def _build_user_prompt(entries: list[dict], planning_today: list[str]) -> str:
    history_text = "\n\n".join(_format_entry(e) for e in entries)
    planning_text = ", ".join(planning_today) if planning_today else "niet opgegeven"
    return f"""Hier is de loghistory van de afgelopen dagen:

{history_text}

Planning vandaag: {planning_text}

Geef de energievoorspelling terug als JSON."""


def _parse_response(raw: str) -> ChargeResult:
    """Extraheert JSON uit de Claude-respons."""
    # Strip markdown code fences indien aanwezig
    text = raw.strip()
    if "```" in text:
        start = text.find("{")
        end = text.rfind("}") + 1
        text = text[start:end]

    data = json.loads(text)
    return ChargeResult(
        percentage=int(data["percentage"]),
        stem=str(data["stem"]),
        vooruitblik=str(data["vooruitblik"]),
    )


async def predict_charge(
    entries: list[dict],
    planning_today: list[str] | None = None,
) -> ChargeResult:
    """
    Berekent het energiepercentage op basis van de loghistory.

    Gooit InsufficientDataError als er minder dan MIN_DAYS entries zijn.
    """
    if len(entries) < MIN_DAYS:
        raise InsufficientDataError(
            f"Minimaal {MIN_DAYS} dagen nodig voor een voorspelling. "
            f"Je hebt er {len(entries)}."
        )

    system_prompt = _load_system_prompt()
    user_prompt = _build_user_prompt(entries, planning_today or [])
    raw = await call_claude(system_prompt, user_prompt)
    return _parse_response(raw)
