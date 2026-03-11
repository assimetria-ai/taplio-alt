-- Migration 004: File tracking + audit log
-- uploaded_files: DB-backed record of every file upload so metadata persists
--                 even if local disk storage is cleared.
-- audit_log:      Immutable record of user actions for compliance and debugging.

CREATE TABLE IF NOT EXISTS uploaded_files (
  id            BIGSERIAL    PRIMARY KEY,
  user_id       INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  key           VARCHAR(500) NOT NULL UNIQUE,
  folder        VARCHAR(100) NOT NULL,
  original_name VARCHAR(255),
  mime_type     VARCHAR(100),
  size_bytes    INTEGER,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id    ON uploaded_files (user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_folder     ON uploaded_files (folder);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id            BIGSERIAL    PRIMARY KEY,
  user_id       INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  action        VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id   VARCHAR(255),
  meta          JSONB        DEFAULT '{}',
  ip            INET,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id    ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action     ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at DESC);
