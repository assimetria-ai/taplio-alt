-- Migration 003: Email delivery log
-- Tracks every outbound email attempt for auditability and debugging.

CREATE TABLE IF NOT EXISTS email_log (
  id          BIGSERIAL    PRIMARY KEY,
  "to"        VARCHAR(255) NOT NULL,
  subject     VARCHAR(500) NOT NULL,
  provider    VARCHAR(50),
  status      VARCHAR(20)  NOT NULL DEFAULT 'sent'
                           CHECK (status IN ('sent', 'failed')),
  error       TEXT,
  message_id  VARCHAR(255),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON email_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_status     ON email_log (status);
CREATE INDEX IF NOT EXISTS idx_email_log_to         ON email_log ("to");
