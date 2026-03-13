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


def get_log_by_date(date: str) -> dict | None:
    """
    Haalt de log op voor een specifieke datum (YYYY-MM-DD).
    Geeft None terug als er geen log bestaat voor die datum.
    """
    init_db()
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM charge_logs WHERE date = ?", (date,)
        ).fetchone()

    if row is None:
        return None

    entry = dict(row)
    entry["planning"] = json.loads(entry["planning"])
    entry["planning_tomorrow"] = json.loads(entry.get("planning_tomorrow") or "[]")
    return entry


def save_verdieping(entry: dict) -> None:
    """
    Slaat verdiepingsdata op (signalen + opladen).
    Bestaande entry voor dezelfde datum wordt overschreven.
    """
    init_db()
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS charge_verdieping (
                date                  TEXT PRIMARY KEY,
                signalen_lichamelijk  TEXT NOT NULL DEFAULT '[]',
                signalen_psychisch    TEXT NOT NULL DEFAULT '[]',
                signalen_gedrag       TEXT NOT NULL DEFAULT '[]',
                opladen               TEXT NOT NULL DEFAULT '[]',
                created_at            TEXT NOT NULL
            )
        """)
        conn.execute(
            """
            INSERT INTO charge_verdieping (
                date, signalen_lichamelijk, signalen_psychisch,
                signalen_gedrag, opladen, created_at
            ) VALUES (
                :date, :signalen_lichamelijk, :signalen_psychisch,
                :signalen_gedrag, :opladen, :created_at
            )
            ON CONFLICT(date) DO UPDATE SET
                signalen_lichamelijk = excluded.signalen_lichamelijk,
                signalen_psychisch   = excluded.signalen_psychisch,
                signalen_gedrag      = excluded.signalen_gedrag,
                opladen              = excluded.opladen,
                created_at           = excluded.created_at
            """,
            {
                "date":                  entry["date"],
                "signalen_lichamelijk":  json.dumps(entry["signalen_lichamelijk"]),
                "signalen_psychisch":    json.dumps(entry["signalen_psychisch"]),
                "signalen_gedrag":       json.dumps(entry["signalen_gedrag"]),
                "opladen":               json.dumps(entry["opladen"]),
                "created_at":            entry["created_at"],
            },
        )


def get_verdieping_by_date(date: str) -> dict | None:
    """Haalt verdieping op voor een datum. Geeft None terug als niet gevonden."""
    try:
        with get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM charge_verdieping WHERE date = ?", (date,)
            ).fetchone()
    except Exception:
        return None

    if row is None:
        return None

    entry = dict(row)
    entry["signalen_lichamelijk"] = json.loads(entry["signalen_lichamelijk"])
    entry["signalen_psychisch"]   = json.loads(entry["signalen_psychisch"])
    entry["signalen_gedrag"]      = json.loads(entry["signalen_gedrag"])
    entry["opladen"]              = json.loads(entry["opladen"])
    return entry


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
