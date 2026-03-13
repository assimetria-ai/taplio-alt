-- Migration 006: Post metrics table
-- Tracks engagement metrics for each post (likes, comments, shares, impressions).

CREATE TABLE IF NOT EXISTS post_metrics (
  id              SERIAL       PRIMARY KEY,
  post_id         UUID         NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  likes           INTEGER      NOT NULL DEFAULT 0,
  comments        INTEGER      NOT NULL DEFAULT 0,
  shares          INTEGER      NOT NULL DEFAULT 0,
  impressions     INTEGER      NOT NULL DEFAULT 0,
  engagement_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0,
  recorded_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- One-to-one by default; use recorded_at for historical snapshots
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_recorded_at    ON post_metrics(recorded_at);
