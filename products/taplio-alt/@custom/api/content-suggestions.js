'use strict'

/**
 * @custom Content Suggestions API
 *
 * Endpoints:
 *   POST /api/suggestions/generate          — generate LinkedIn post ideas
 *   POST /api/suggestions/optimal-times     — optimal posting time slots by industry
 *   POST /api/suggestions/predict-performance — predict content performance metrics
 */

const express = require('express')
const router = express.Router()
const { generatePostIdeas, predictPerformance, getOptimalTimes } = require('./openai-client')

// ── POST /api/suggestions/generate ───────────────────────────────────────────

router.post('/api/suggestions/generate', async (req, res) => {
  try {
    const { industry, topics = [], tone = 'professional', count = 5 } = req.body

    if (!industry && (!Array.isArray(topics) || topics.length === 0)) {
      return res.status(400).json({ error: 'Provide at least an industry or one topic' })
    }

    const VALID_TONES = ['professional', 'casual', 'bold']
    const safeTone = VALID_TONES.includes(tone) ? tone : 'professional'

    const suggestions = await generatePostIdeas(industry, topics, safeTone, count)
    res.json({ suggestions })
  } catch (err) {
    console.error('[suggestions] generate error:', err.message)
    const status = err.code === 'RATE_LIMIT' ? 429 : 500
    res.status(status).json({ error: err.message || 'Failed to generate suggestions' })
  }
})

// ── POST /api/suggestions/optimal-times ──────────────────────────────────────

router.post('/api/suggestions/optimal-times', async (req, res) => {
  try {
    const { timezone = 'UTC', industry } = req.body

    if (typeof timezone !== 'string' || timezone.trim().length === 0) {
      return res.status(400).json({ error: 'timezone must be a non-empty string' })
    }

    const result = await getOptimalTimes(industry, timezone)
    res.json(result)
  } catch (err) {
    console.error('[suggestions] optimal-times error:', err.message)
    res.status(500).json({ error: 'Failed to get optimal posting times' })
  }
})

// ── POST /api/suggestions/predict-performance ────────────────────────────────

router.post('/api/suggestions/predict-performance', async (req, res) => {
  try {
    const { content, industry } = req.body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'content is required' })
    }

    if (content.length > 3000) {
      return res.status(400).json({ error: 'Content too long (max 3000 characters)' })
    }

    const prediction = await predictPerformance(content.trim(), industry)
    res.json({ prediction })
  } catch (err) {
    console.error('[suggestions] predict-performance error:', err.message)
    const status = err.code === 'RATE_LIMIT' ? 429 : 500
    res.status(status).json({ error: err.message || 'Failed to predict performance' })
  }
})

module.exports = router
