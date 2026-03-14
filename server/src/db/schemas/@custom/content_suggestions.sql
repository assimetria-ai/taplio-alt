-- @custom Schema: Content Suggestions
-- AI-powered content idea suggestions and optimal posting time recommendations

CREATE TABLE IF NOT EXISTS content_suggestions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Generation inputs
  industry    TEXT,
  topics      TEXT[],                -- Array of topic strings

  -- Generated output
  suggestions JSONB NOT NULL DEFAULT '[]',
  -- Each suggestion: { title, content, hashtags[], format, estimated_engagement }

  -- Model info
  model       TEXT,
  tokens_used INTEGER DEFAULT 0,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_suggestions_user_id
  ON content_suggestions(user_id, created_at DESC);

COMMENT ON TABLE content_suggestions IS 'AI-generated LinkedIn content suggestions per user';
COMMENT ON COLUMN content_suggestions.suggestions IS 'Array of suggestion objects: { title, content, hashtags, format, estimated_engagement }';

-- Optimal posting times learned from engagement patterns
CREATE TABLE IF NOT EXISTS optimal_posting_times (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  timezone    TEXT NOT NULL DEFAULT 'UTC',
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun, 6=Sat
  hour        SMALLINT NOT NULL CHECK (hour BETWEEN 0 AND 23),

  score       NUMERIC(5, 2) NOT NULL DEFAULT 0,    -- 0-100 confidence score
  sample_size INTEGER NOT NULL DEFAULT 0,

  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, timezone, day_of_week, hour)
);

CREATE INDEX IF NOT EXISTS idx_optimal_posting_times_user_id
  ON optimal_posting_times(user_id, score DESC);

COMMENT ON TABLE optimal_posting_times IS 'Optimal LinkedIn posting time slots per user with confidence scores';
COMMENT ON COLUMN optimal_posting_times.day_of_week IS '0=Sunday through 6=Saturday';
COMMENT ON COLUMN optimal_posting_times.score IS 'Confidence score 0-100 based on engagement data or AI estimates';
