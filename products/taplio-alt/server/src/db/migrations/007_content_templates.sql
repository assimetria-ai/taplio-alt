-- Migration 007: Content templates table
-- Pre-built and user-created templates for LinkedIn post formats.

CREATE TABLE IF NOT EXISTS content_templates (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    INTEGER      REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  content    TEXT         NOT NULL,
  category   VARCHAR(100),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_templates_user_id   ON content_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_category  ON content_templates(category);
