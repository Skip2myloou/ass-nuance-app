"""
Charge — lokale SQLite opslag voor dagelijkse loginvoer.
Privacy-first: geen account, geen cloud, data blijft op de server
totdat cloud sync in versie 2 wordt toegevoegd.
"""

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path("/tmp/charge.db")


def get_db_path() -> Path:
    """Geeft het pad naar de SQLite database. Overschrijfbaar via env."""
    import os

    return Path(os.environ.get("CHARGE_DB_PATH", str(DB_PATH)))


@contextmanager
def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Maakt de tabel aan als die nog niet bestaat."""
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS charge_logs (
                date              TEXT PRIMARY KEY,
                stress            INTEGER NOT NULL CHECK (stress BETWEEN 1 AND 10),
                social_count      INTEGER NOT NULL DEFAULT 0,
                social_intensity  TEXT NOT NULL,
                planning          TEXT NOT NULL,
                sleep_hours       REAL,
                sleep_quality     TEXT,
                planning_tomorrow TEXT,
                notes             TEXT,
                created_at        TEXT NOT NULL
            )
        """)


def save_log(entry: dict) -> None:
    """
    Slaat een log-entry op. Bestaande entry voor dezelfde datum
    wordt overschreven (UPSERT).
    """
    init_db()
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO charge_logs (
                date, stress, social_count, social_intensity,
                planning, sleep_hours, sleep_quality,
                planning_tomorrow, notes, created_at
            ) VALUES (
                :date, :stress, :social_count, :social_intensity,
                :planning, :sleep_hours, :sleep_quality,
                :planning_tomorrow, :notes, :created_at
            )
            ON CONFLICT(date) DO UPDATE SET
                stress            = excluded.stress,
                social_count      = excluded.social_count,
                social_intensity  = excluded.social_intensity,
                planning          = excluded.planning,
                sleep_hours       = excluded.sleep_hours,
                sleep_quality     = excluded.sleep_quality,
                planning_tomorrow = excluded.planning_tomorrow,
                notes             = excluded.notes,
                created_at        = excluded.created_at
        """,
            {
                **entry,
                "planning": json.dumps(entry["planning"]),
                "planning_tomorrow": json.dumps(entry.get("planning_tomorrow") or []),
            },
        )


def get_history(days: int = 7) -> list[dict]:
    """
    Haalt de meest recente N dagen op, gesorteerd van oud naar nieuw
    zodat de Claude-prompt chronologisch leest.
    """
    init_db()
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT * FROM charge_logs
            ORDER BY date DESC
            LIMIT ?
        """,
            (days,),
        ).fetchall()

    entries = []
    for row in reversed(rows):  # oud → nieuw
        entry = dict(row)
        entry["planning"] = json.loads(entry["planning"])
        entry["planning_tomorrow"] = json.loads(entry.get("planning_tomorrow") or "[]")
        entries.append(entry)

    return entries
