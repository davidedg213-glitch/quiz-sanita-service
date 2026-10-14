PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL,
  current_session_hash TEXT, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS banks (
  id TEXT PRIMARY KEY, version TEXT UNIQUE NOT NULL, checksum TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL, question_count INTEGER NOT NULL CHECK(question_count >= 30),
  status TEXT NOT NULL CHECK(status IN ('approved','active','retired')), imported_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_bank ON banks(status) WHERE status='active';
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), bank_id TEXT NOT NULL REFERENCES banks(id),
  request_key TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('in_progress','submitted','expired')),
  started_at INTEGER NOT NULL, deadline_at INTEGER NOT NULL, finalized_at INTEGER,
  duration_seconds INTEGER NOT NULL, rules_json TEXT NOT NULL, questions_json TEXT NOT NULL, result_json TEXT,
  UNIQUE(user_id,request_key)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_attempt ON attempts(user_id) WHERE status='in_progress';
CREATE INDEX IF NOT EXISTS attempts_user_date ON attempts(user_id,started_at DESC);
CREATE TABLE IF NOT EXISTS answers (
  attempt_id TEXT NOT NULL REFERENCES attempts(id), question_id TEXT NOT NULL,
  selected_json TEXT NOT NULL, version INTEGER NOT NULL, saved_at INTEGER NOT NULL,
  PRIMARY KEY(attempt_id,question_id)
);
CREATE TABLE IF NOT EXISTS trial_ledger (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), attempt_id TEXT UNIQUE REFERENCES attempts(id),
  delta INTEGER NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS trial_user ON trial_ledger(user_id);
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, resets_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO schema_migrations(version,applied_at) VALUES(1,unixepoch()*1000);
