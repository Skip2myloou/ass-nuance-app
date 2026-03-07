from pathlib import Path

import anthropic
from fastapi import HTTPException

from app.schemas import RealityCheckResult
from app.settings import get_settings

SYSTEM_PROMPT = (
    Path(__file__).parent.parent / "prompts" / "lenslab_reality_check.md"
).read_text()

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


async def get_reality_check(
    original: str,
    literal: str,
    threat: str,
    social: str,
    romantic: str,
) -> RealityCheckResult:
    client = _get_client()

    user_message = f"""Original message:
"{original}"

How this message was read through four lenses:
- Literal: {literal}
- Threat: {threat}
- Social: {social}
- Romantic: {romantic}

Generate three reality check questions."""

    try:
        response = await client.messages.parse(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
            output_format=RealityCheckResult,
        )
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key.")
    except anthropic.RateLimitError:
        raise HTTPException(
            status_code=429, detail="Rate limit reached. Try again shortly."
        )
    except anthropic.APITimeoutError:
        raise HTTPException(status_code=504, detail="Claude request timed out.")
    except anthropic.BadRequestError:
        raise HTTPException(status_code=400, detail="Input was rejected by the API.")
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
