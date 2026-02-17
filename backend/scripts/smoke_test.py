#!/usr/bin/env python3
"""Quick smoke test — calls Claude with a trivial prompt and prints the result.

Usage:
    cd backend
    .venv/bin/python -m scripts.smoke_test
"""

import asyncio
import sys
from pathlib import Path

# Ensure the backend package is importable when run from the backend/ dir.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.claude import call_claude  # noqa: E402


async def main() -> None:
    print("→ Sending smoke-test request to Claude …")
    response = await call_claude(
        system_prompt="You are a helpful assistant. Reply in one short sentence.",
        user_prompt="Say hello and confirm you are working.",
    )
    print(f"✓ Response:\n{response}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as exc:
        print(f"✗ Smoke test failed: {exc}", file=sys.stderr)
        sys.exit(1)
