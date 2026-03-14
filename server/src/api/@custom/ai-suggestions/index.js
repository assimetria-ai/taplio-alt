/**
 * @custom AI Suggestions API
 * AI-powered LinkedIn content engine: post ideas, optimal timing, and performance prediction.
 *
 * Routes:
 *   POST /api/ai/suggest-content       — Generate 3 LinkedIn post ideas
 *   POST /api/ai/optimal-times         — Get best posting time windows
 *   POST /api/ai/predict-performance   — Predict engagement for a draft post
 *   POST /api/ai/hashtags              — Generate optimised hashtags
 *   GET  /api/ai/history               — Paginated request history
 */

const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../../middleware/@system/auth')
const AIContentEngine = require('../../../lib/@custom/AIContentEngine')
const AIEngineRepo = require('../../../db/repos/@custom/AIEngineRepo')

// All routes require authentication
router.use(requireAuth)

// ── Input validation helpers ───────────────────────────────────────────────────

const VALID_TONES   = ['professional', 'casual', 'bold']
const VALID_LENGTHS = ['short', 'medium', 'long']
const VALID_FORMATS = ['text', 'listicle', 'story']

function validateEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback
}

function trimString(value, maxLen) {
  if (typeof value !== 'string') return null
  return value.trim().slice(0, maxLen) || null
}

// ── Soft per-user rate limiting (in-process, resets on restart) ───────────────
// For production, replace with Redis-backed sliding window.

const userRequestCounts = new Map()
const RATE_WINDOW_MS = 60 * 1000   // 1 minute
const RATE_LIMIT     = 20          // max 20 AI requests per minute per user

function checkRateLimit(userId) {
  const now = Date.now()
  const key = String(userId)
  const record = userRequestCounts.get(key) || { count: 0, windowStart: now }

  if (now - record.windowStart > RATE_WINDOW_MS) {
    // New window
    record.count = 1
    record.windowStart = now
  } else {
    record.count += 1
  }
  userRequestCounts.set(key, record)
  return record.count <= RATE_LIMIT
}

// ── POST /api/ai/suggest-content ──────────────────────────────────────────────

router.post('/api/ai/suggest-content', async (req, res) => {
  try {
    const { topic, tone, length, format, industry } = req.body

    const cleanTopic = trimString(topic, 200)
    if (!cleanTopic) {
      return res.status(400).json({ error: 'topic is required' })
    }

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({ error: 'Too many requests — please wait a moment and try again' })
    }

    const safeTone     = validateEnum(tone,   VALID_TONES,   'professional')
    const safeLength   = validateEnum(length, VALID_LENGTHS, 'medium')
    const safeFormat   = validateEnum(format, VALID_FORMATS, 'text')
    const cleanIndustry = trimString(industry, 100)

    const engineResult = await AIContentEngine.generatePostIdeas(
      cleanTopic,
      safeTone,
      safeLength,
      safeFormat,
      cleanIndustry,
    )

    // Persist audit record (non-blocking — don't fail the request if this errors)
    AIEngineRepo.create({
      userId:     req.user.id,
      endpoint:   'suggest-content',
      input:      { topic: cleanTopic, tone: safeTone, length: safeLength, format: safeFormat, industry: cleanIndustry },
      output:     { suggestions: engineResult.suggestions },
      model:      engineResult.model,
      tokensUsed: engineResult.tokensUsed,
    }).catch((err) => console.error('[ai-suggestions] persist error:', err.message))

    res.json({
      suggestions: engineResult.suggestions,
      meta: {
        topic:    cleanTopic,
        tone:     safeTone,
        length:   safeLength,
        format:   safeFormat,
        industry: cleanIndustry,
        model:    engineResult.model,
      },
    })
  } catch (err) {
    console.error('[ai-suggestions] suggest-content error:', err.message)
    if (err.statusCode === 429) {
      return res.status(429).json({ error: 'OpenAI rate limit reached — try again shortly' })
    }
    res.status(500).json({ error: 'Failed to generate content suggestions' })
  }
})

// ── POST /api/ai/optimal-times ────────────────────────────────────────────────

router.post('/api/ai/optimal-times', async (req, res) => {
  try {
    const { timezone, industry } = req.body

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({ error: 'Too many requests — please wait a moment and try again' })
    }

    const cleanTimezone = trimString(timezone, 60) || 'UTC'
    const cleanIndustry = trimString(industry, 100)

    const engineResult = await AIContentEngine.suggestOptimalTimes(cleanTimezone, cleanIndustry)

    AIEngineRepo.create({
      userId:     req.user.id,
      endpoint:   'optimal-times',
      input:      { timezone: cleanTimezone, industry: cleanIndustry },
      output:     { slots: engineResult.slots },
      model:      engineResult.model,
      tokensUsed: engineResult.tokensUsed,
    }).catch((err) => console.error('[ai-suggestions] persist error:', err.message))

    res.json({
      slots: engineResult.slots,
      meta: {
        timezone: cleanTimezone,
        industry: cleanIndustry,
        model:    engineResult.model,
      },
    })
  } catch (err) {
    console.error('[ai-suggestions] optimal-times error:', err.message)
    if (err.statusCode === 429) {
      return res.status(429).json({ error: 'OpenAI rate limit reached — try again shortly' })
    }
    res.status(500).json({ error: 'Failed to retrieve optimal posting times' })
  }
})

// ── POST /api/ai/predict-performance ─────────────────────────────────────────

router.post('/api/ai/predict-performance', async (req, res) => {
  try {
    const { content, format } = req.body

    const cleanContent = trimString(content, 3000)
    if (!cleanContent) {
      return res.status(400).json({ error: 'content is required' })
    }
    if (cleanContent.length > 3000) {
      return res.status(400).json({ error: 'content exceeds 3000 character limit' })
    }

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({ error: 'Too many requests — please wait a moment and try again' })
    }

    const safeFormat = validateEnum(format, VALID_FORMATS, 'text')

    const engineResult = await AIContentEngine.predictPerformance(cleanContent, safeFormat)

    AIEngineRepo.create({
      userId:     req.user.id,
      endpoint:   'predict-performance',
      input:      { content: cleanContent, format: safeFormat },
      output:     { prediction: engineResult.prediction },
      model:      engineResult.model,
      tokensUsed: engineResult.tokensUsed,
    }).catch((err) => console.error('[ai-suggestions] persist error:', err.message))

    res.json({
      prediction: engineResult.prediction,
      meta: {
        format: safeFormat,
        model:  engineResult.model,
      },
    })
  } catch (err) {
    console.error('[ai-suggestions] predict-performance error:', err.message)
    if (err.statusCode === 429) {
      return res.status(429).json({ error: 'OpenAI rate limit reached — try again shortly' })
    }
    res.status(500).json({ error: 'Failed to predict performance' })
  }
})

// ── POST /api/ai/hashtags ─────────────────────────────────────────────────────

router.post('/api/ai/hashtags', async (req, res) => {
  try {
    const { content, count } = req.body

    const cleanContent = trimString(content, 1000)
    if (!cleanContent) {
      return res.status(400).json({ error: 'content is required' })
    }

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({ error: 'Too many requests — please wait a moment and try again' })
    }

    const safeCount = Math.min(Math.max(parseInt(count, 10) || 8, 3), 15)

    const engineResult = await AIContentEngine.generateHashtags(cleanContent, safeCount)

    AIEngineRepo.create({
      userId:     req.user.id,
      endpoint:   'hashtags',
      input:      { content: cleanContent, count: safeCount },
      output:     { hashtags: engineResult.hashtags, categorized: engineResult.categorized },
      model:      engineResult.model,
      tokensUsed: engineResult.tokensUsed,
    }).catch((err) => console.error('[ai-suggestions] persist error:', err.message))

    res.json({
      hashtags:       engineResult.hashtags,
      categorized:    engineResult.categorized,
      reach_estimate: engineResult.reach_estimate,
      meta: {
        count: safeCount,
        model: engineResult.model,
      },
    })
  } catch (err) {
    console.error('[ai-suggestions] hashtags error:', err.message)
    if (err.statusCode === 429) {
      return res.status(429).json({ error: 'OpenAI rate limit reached — try again shortly' })
    }
    res.status(500).json({ error: 'Failed to generate hashtags' })
  }
})

// ── GET /api/ai/history ───────────────────────────────────────────────────────

router.get('/api/ai/history', async (req, res) => {
  try {
    const { endpoint, limit = 20, offset = 0 } = req.query

    const safeLimit  = Math.min(parseInt(limit, 10) || 20, 100)
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0)
    const VALID_ENDPOINTS = ['suggest-content', 'optimal-times', 'predict-performance', 'hashtags']
    const cleanEndpoint = endpoint && VALID_ENDPOINTS.includes(endpoint) ? endpoint : undefined

    const [records, total] = await Promise.all([
      AIEngineRepo.findByUser(req.user.id, { endpoint: cleanEndpoint, limit: safeLimit, offset: safeOffset }),
      AIEngineRepo.countByUser(req.user.id, cleanEndpoint),
    ])

    res.json({
      history: records,
      pagination: {
        total,
        limit:  safeLimit,
        offset: safeOffset,
      },
    })
  } catch (err) {
    console.error('[ai-suggestions] history error:', err.message)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

module.exports = router
