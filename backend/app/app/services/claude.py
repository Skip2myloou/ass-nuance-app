"""Anthropic Claude API client with timeout and single-retry."""

import anthropic
from fastapi import HTTPException

from app.settings import get_settings

_client: anthropic.AsyncAnthropic | None = None


def _get_client() -> anthropic.AsyncAnthropic:
    """Lazy-init a module-level async client (reuses connection pool)."""
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.anthropic_api_key:
            raise HTTPException(
                status_code=500,
                detail="ANTHROPIC_API_KEY is not configured.",
            )
        _client = anthropic.AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=settings.anthropic_timeout,
            max_retries=settings.anthropic_max_retries,
        )
    return _client


async def call_claude(system_prompt: str, user_prompt: str) -> str:
    """Send a system + user message to Claude and return the assistant text.

    Raises ``HTTPException`` with an appropriate status code on failure:
    - 401 → bad API key
    - 429 → rate-limited
    - 502 → upstream model error or unexpected failure
    - 504 → timeout
    """
    settings = get_settings()
    client = _get_client()

    try:
        message = await client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return message.content[0].text

    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key.")

    except anthropic.RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="Anthropic rate limit reached. Please try again shortly.",
        )

    except anthropic.APITimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Claude request timed out. Please try again.",
        )

    except anthropic.APIStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude API error ({exc.status_code}): {exc.message}",
        )

    except anthropic.APIConnectionError:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to Anthropic API.",
        )
