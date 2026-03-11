-- Migration 002: Items table
-- Scaffold example table for the CRUD / pagination / search helpers.
-- Copy and rename this for your own resource types.

CREATE TABLE IF NOT EXISTS items (
  id         SERIAL       PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  body       TEXT,
  status     VARCHAR(20)  NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published', 'archived')),
  user_id    INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_items_status  ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
