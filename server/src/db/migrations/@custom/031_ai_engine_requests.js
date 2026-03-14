/**
 * @custom Migration: AI Engine Requests
 * Audit table for all AI content engine API calls.
 * Tracks inputs, outputs, model info, and token usage per user per endpoint.
 */

const db = require('../../repos/@system/db-instance')

async function up() {
  await db.none(`
    CREATE TABLE IF NOT EXISTS ai_engine_requests (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      -- Which endpoint was hit
      endpoint     TEXT NOT NULL,
      -- Values: 'suggest-content' | 'optimal-times' | 'predict-performance' | 'hashtags'

      -- Full request and response payloads
      input        JSONB NOT NULL DEFAULT '{}',
      output       JSONB NOT NULL DEFAULT '{}',

      -- Model metadata
      model        TEXT,
      tokens_used  INTEGER NOT NULL DEFAULT 0,

      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_ai_engine_requests_user_id
      ON ai_engine_requests(user_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_ai_engine_requests_endpoint
      ON ai_engine_requests(user_id, endpoint, created_at DESC);

    COMMENT ON TABLE ai_engine_requests IS 'Audit trail for AI content engine calls — inputs, outputs, token usage';
    COMMENT ON COLUMN ai_engine_requests.endpoint IS 'suggest-content | optimal-times | predict-performance | hashtags';
    COMMENT ON COLUMN ai_engine_requests.tokens_used IS 'Total OpenAI tokens consumed by this request';
  `)
  console.log('  ✓ ai_engine_requests table created')
}

async function down() {
  await db.none('DROP TABLE IF EXISTS ai_engine_requests CASCADE')
}

module.exports = { up, down }
