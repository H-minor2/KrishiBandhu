
import json
import os
import sqlite3
import time
from contextlib import contextmanager

from .config import DATABASE_PATH


def init_db():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    with sqlite3.connect(DATABASE_PATH) as con:
        con.execute("""
            CREATE TABLE IF NOT EXISTS cache (
                cache_key TEXT PRIMARY KEY,
                created_at REAL NOT NULL,
                payload TEXT NOT NULL
            )
        """)
        con.commit()


@contextmanager
def connection():
    init_db()
    con = sqlite3.connect(DATABASE_PATH)
    try:
        yield con
        con.commit()
    finally:
        con.close()


def get_cache(key: str, ttl: int):
    with connection() as con:
        row = con.execute(
            "SELECT created_at, payload FROM cache WHERE cache_key=?",
            (key,),
        ).fetchone()

    if not row:
        return None

    if time.time() - row[0] > ttl:
        return None

    try:
        return json.loads(row[1])
    except json.JSONDecodeError:
        return None


def set_cache(key: str, payload):
    with connection() as con:
        con.execute(
            """
            INSERT INTO cache(cache_key, created_at, payload)
            VALUES (?, ?, ?)
            ON CONFLICT(cache_key) DO UPDATE SET
                created_at=excluded.created_at,
                payload=excluded.payload
            """,
            (key, time.time(), json.dumps(payload)),
        )


def clear_cache():
    with connection() as con:
        con.execute("DELETE FROM cache")
