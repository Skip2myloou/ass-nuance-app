"""LensLab service — analyzes a message through four cognitive lenses."""

from pathlib import Path

import anthropic
from fastapi import HTTPException

from app.schemas import LensResult
from app.settings import get_settings

SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "lenslab.md").read_text()

_MODEL = "claude-sonnet-4-6"

_client: anthropic.AsyncAnthropic | None = None


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        settings = get_settings()
        _client = anthropic.AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=settings.anthropic_timeout,
            max_retries=settings.anthropic_max_retries,
        )
    return _client


async def analyze(user_input: str) -> LensResult:
    client = _get_client()
    try:
        response = await client.messages.parse(
            model=_MODEL,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f'Here is the message to analyze:\n\n"{user_input}"',
                }
            ],
            output_format=LensResult,
        )
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key.")
    except anthropic.RateLimitError:
        raise HTTPException(
            status_code=429, detail="Rate limit reached. Please try again shortly."
        )
    except anthropic.BadRequestError:
        raise HTTPException(
            status_code=400,
            detail="Input was rejected by the API. Message may contain disallowed content.",
        )
    except anthropic.APITimeoutError:
        raise HTTPException(
            status_code=504, detail="Claude request timed out. Please try again."
        )
    except anthropic.APIStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude API error ({exc.status_code}): {exc.message}",
        )
    except anthropic.APIConnectionError:
        raise HTTPException(
            status_code=502, detail="Could not connect to Anthropic API."
        )

    if response.parsed_output is None:
        raise HTTPException(
            status_code=502,
            detail=f"Unparseable response (stop_reason: {response.stop_reason})",
        )
    return response.parsed_output
