"""Postgres-backed account and event-plan store, with SQLite for local use."""
import hashlib
import hmac
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from contextlib import contextmanager
from pathlib import Path

DATABASE_URL = os.getenv("DATABASE_URL")
DB_PATH = Path(os.getenv("DATABASE_PATH", Path(__file__).with_name("celebratai.db")))
PBKDF2_ROUNDS = 310_000
SESSION_DAYS = 30


@contextmanager
def connect():
    if DATABASE_URL:
        import psycopg
        from psycopg.rows import dict_row
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as db:
            yield db
        return

    db = sqlite3.connect(DB_PATH, timeout=10)
    db.row_factory = sqlite3.Row
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _execute(db, sql, params=()):
    if DATABASE_URL:
        sql = sql.replace("?", "%s")
    return db.execute(sql, params)


def initialize():
    if DATABASE_URL:
        with connect() as db:
            db.execute("CREATE TABLE IF NOT EXISTS users (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS event_plans (user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, plan_json TEXT NOT NULL, updated_at TEXT NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS event_plan_history (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, plan_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)")
    else:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        with connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS event_plans (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                plan_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS event_plan_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """)
    # Preserve plans created before event history was introduced.
    with connect() as db:
        _execute(db, """
            INSERT INTO event_plan_history(user_id,plan_json,created_at,updated_at)
            SELECT e.user_id,e.plan_json,e.updated_at,e.updated_at FROM event_plans e
            WHERE NOT EXISTS (SELECT 1 FROM event_plan_history h WHERE h.user_id=e.user_id)
        """)


def _now():
    return datetime.now(timezone.utc)


def _public_user(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"]}


def _hash_password(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ROUNDS)
    return f"{salt.hex()}:{digest.hex()}"


def _verify_password(password, stored):
    try:
        salt_hex, digest_hex = stored.split(":", 1)
        candidate = _hash_password(password, bytes.fromhex(salt_hex)).split(":", 1)[1]
        return hmac.compare_digest(candidate, digest_hex)
    except (ValueError, TypeError):
        return False


def _create_session(db, user_id):
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires = (_now() + timedelta(days=SESSION_DAYS)).isoformat()
    _execute(db, "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)", (token_hash, user_id, expires))
    return token


def register(name, email, password):
    with connect() as db:
        row = _execute(db,
            "INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?) "
            "ON CONFLICT(email) DO NOTHING RETURNING id",
            (name.strip(), email.strip().lower(), _hash_password(password), _now().isoformat()),
        ).fetchone()
        if row is None:
            return None
        user = _execute(db, "SELECT id,name,email FROM users WHERE id=?", (row["id"],)).fetchone()
        token = _create_session(db, row["id"])
        return {"user": _public_user(user), "token": token}


def login(email, password):
    with connect() as db:
        row = _execute(db, "SELECT * FROM users WHERE email=?", (email.strip().lower(),)).fetchone()
        if not row or not _verify_password(password, row["password_hash"]):
            return None
        return {"user": _public_user(row), "token": _create_session(db, row["id"])}


def user_for_token(token):
    if not token:
        return None
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    with connect() as db:
        row = _execute(db,
            "SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?",
            (token_hash, _now().isoformat()),
        ).fetchone()
        return _public_user(row) if row else None


def delete_session(token):
    if not token:
        return
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    with connect() as db:
        _execute(db, "DELETE FROM sessions WHERE token_hash=?", (token_hash,))


def get_plan(user_id):
    with connect() as db:
        row = _execute(db, "SELECT plan_json FROM event_plans WHERE user_id=?", (user_id,)).fetchone()
        return row["plan_json"] if row else None


def save_plan(user_id, plan_json):
    with connect() as db:
        _execute(db,
            "INSERT INTO event_plans(user_id,plan_json,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET plan_json=excluded.plan_json,updated_at=excluded.updated_at",
            (user_id, plan_json, _now().isoformat()),
        )


def create_plan(user_id, plan_json):
    now = _now().isoformat()
    with connect() as db:
        row = _execute(db,
            "INSERT INTO event_plan_history(user_id,plan_json,created_at,updated_at) VALUES(?,?,?,?) RETURNING id",
            (user_id, plan_json, now, now),
        ).fetchone()
        return row["id"]


def list_plans(user_id):
    with connect() as db:
        return _execute(db,
            "SELECT id,plan_json,created_at,updated_at FROM event_plan_history WHERE user_id=? ORDER BY updated_at DESC",
            (user_id,),
        ).fetchall()


def update_plan(user_id, plan_id, plan_json):
    with connect() as db:
        cursor = _execute(db,
            "UPDATE event_plan_history SET plan_json=?,updated_at=? WHERE id=? AND user_id=?",
            (plan_json, _now().isoformat(), plan_id, user_id),
        )
        return cursor.rowcount > 0


def delete_plan(user_id, plan_id):
    with connect() as db:
        cursor = _execute(db, "DELETE FROM event_plan_history WHERE id=? AND user_id=?", (plan_id, user_id))
        return cursor.rowcount > 0
