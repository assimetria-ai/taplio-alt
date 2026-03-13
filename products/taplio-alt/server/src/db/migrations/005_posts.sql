-- Migration 005: Posts table
-- Stores LinkedIn posts with scheduling and publishing support.

CREATE TABLE IF NOT EXISTS posts (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content       TEXT         NOT NULL,
  scheduled_for TIMESTAMPTZ,
  published_at  TIMESTAMPTZ,
  status        VARCHAR(20)  NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  linkedin_post_id VARCHAR(255),
  linkedin_url  VARCHAR(500),
  media_urls    JSONB,
  hashtags      TEXT[],
  mentions      TEXT[],
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id       ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status         ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for  ON posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_published_at   ON posts(published_at);
