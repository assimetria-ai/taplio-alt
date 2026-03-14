/**
 * @custom Content Suggestions API
 * AI-powered content idea generation, optimal posting time suggestions,
 * and performance predictions for LinkedIn posts.
 */
const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../../middleware/@system/auth')
const AI = require('../../../lib/@system/AI')
const ContentSuggestionRepo = require('../../../db/repos/@custom/ContentSuggestionRepo')

router.use(requireAuth)

// ── POST /api/content-suggestions/generate ──────────────────────────────────
// Generate LinkedIn post ideas based on industry and topics
router.post('/api/content-suggestions/generate', async (req, res) => {
  try {
    const { industry, topics = [], tone = 'professional', count = 5 } = req.body

    if (!industry && topics.length === 0) {
      return res.status(400).json({ error: 'Provide at least an industry or one topic' })
    }

    const safeCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10)
    const topicsText = topics.length > 0 ? topics.join(', ') : 'general professional content'

    const system = `You are a LinkedIn content strategist specializing in viral B2B posts.
Your goal is to generate highly engaging LinkedIn post ideas that drive impressions, comments, and follows.
Always respond with valid JSON only — no markdown, no extra text.`

    const prompt = `Generate ${safeCount} LinkedIn post ideas for the ${industry || 'professional'} industry.
Topics to cover: ${topicsText}
Desired tone: ${tone}

Return a JSON array of exactly ${safeCount} objects. Each object must have:
- title: short headline describing the post idea (max 80 chars)
- content: full draft of the LinkedIn post (150-300 words, include line breaks, end with a question)
- hashtags: array of 4-6 relevant hashtags (without the # symbol)
- format: one of "text_post" | "listicle" | "story" | "how_to" | "hot_take" | "carousel_outline"
- estimated_engagement: object with { impressions: number, likes: number, comments: number, engagement_rate: string }

The engagement estimates should be realistic for a mid-sized LinkedIn audience (5k-15k followers).`

    const result = await AI.openai.chat({
      prompt,
      system,
      model: 'gpt-4o-mini',
      maxTokens: 3000,
      temperature: 0.8,
    })

    let suggestions
    try {
      suggestions = JSON.parse(result.content)
      if (!Array.isArray(suggestions)) throw new Error('Not an array')
    } catch {
      return res.status(502).json({ error: 'AI returned invalid JSON', raw: result.content })
    }

    // Persist to DB
    const record = await ContentSuggestionRepo.create({
      userId: req.user.id,
      industry: industry || null,
      topics,
      suggestions,
      model: result.model,
      tokensUsed: result.usage?.totalTokens || 0,
    })

    res.json({ suggestions, id: record.id })
  } catch (err) {
    console.error('[content-suggestions] generate error:', err.message)
    res.status(500).json({ error: 'Failed to generate content suggestions' })
  }
})

// ── POST /api/content-suggestions/optimal-times ─────────────────────────────
// Suggest optimal LinkedIn posting times
router.post('/api/content-suggestions/optimal-times', async (req, res) => {
  try {
    const { timezone = 'UTC', dayOfWeek } = req.body

    // Check if we have stored data first
    const stored = await ContentSuggestionRepo.getTopPostingSlots(req.user.id, {
      timezone,
      limit: 10,
    })

    if (stored.length >= 5) {
      // Return stored data enriched with labels
      const slots = stored.map((row) => ({
        day_of_week: row.day_of_week,
        day_name: DAY_NAMES[row.day_of_week],
        hour: row.hour,
        time_label: formatHour(row.hour),
        score: parseFloat(row.score),
        confidence: scoreToConfidence(parseFloat(row.score)),
        sample_size: row.sample_size,
      }))
      return res.json({ slots, source: 'historical' })
    }

    // Generate AI-based recommendations
    const system = `You are a LinkedIn analytics expert. You know optimal posting times based on industry research.
Respond with valid JSON only — no markdown, no extra text.`

    const dayFilter = dayOfWeek !== undefined
      ? `Focus on ${DAY_NAMES[dayOfWeek]} (day ${dayOfWeek}).`
      : 'Cover a range of days throughout the week.'

    const prompt = `Suggest the top 7 optimal LinkedIn posting time slots for maximum engagement.
Timezone context: ${timezone}
${dayFilter}

Return a JSON array of 7 objects, each with:
- day_of_week: integer 0-6 (0=Sunday, 6=Saturday)
- hour: integer 0-23 (hour in the given timezone)
- score: float 0-100 (confidence score based on typical LinkedIn engagement patterns)
- rationale: one sentence explaining why this time works

Base recommendations on LinkedIn's known engagement patterns:
- Business hours (8am-5pm) on weekdays generally perform best
- Tuesday, Wednesday, Thursday tend to have highest engagement
- Early morning (7-9am) and lunch (12-1pm) are peak windows
- Weekends have lower but targeted engagement`

    const result = await AI.openai.chat({
      prompt,
      system,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.3,
    })

    let aiSlots
    try {
      aiSlots = JSON.parse(result.content)
      if (!Array.isArray(aiSlots)) throw new Error('Not an array')
    } catch {
      return res.status(502).json({ error: 'AI returned invalid JSON' })
    }

    // Persist AI-generated slots
    await Promise.all(
      aiSlots.map((slot) =>
        ContentSuggestionRepo.upsertPostingTime({
          userId: req.user.id,
          timezone,
          dayOfWeek: slot.day_of_week,
          hour: slot.hour,
          score: slot.score,
          sampleSize: 0,
        }).catch(() => null)
      )
    )

    const slots = aiSlots.map((slot) => ({
      day_of_week: slot.day_of_week,
      day_name: DAY_NAMES[slot.day_of_week] || 'Unknown',
      hour: slot.hour,
      time_label: formatHour(slot.hour),
      score: parseFloat(slot.score),
      confidence: scoreToConfidence(parseFloat(slot.score)),
      rationale: slot.rationale,
      sample_size: 0,
    }))

    res.json({ slots, source: 'ai' })
  } catch (err) {
    console.error('[content-suggestions] optimal-times error:', err.message)
    res.status(500).json({ error: 'Failed to get optimal posting times' })
  }
})

// ── POST /api/content-suggestions/predict-performance ───────────────────────
// Predict engagement performance for a piece of content
router.post('/api/content-suggestions/predict-performance', async (req, res) => {
  try {
    const { content, format = 'text_post' } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' })
    }

    if (content.length > 3000) {
      return res.status(400).json({ error: 'Content too long (max 3000 chars)' })
    }

    const system = `You are a LinkedIn analytics expert who predicts post performance based on content analysis.
Respond with valid JSON only — no markdown, no extra text.`

    const prompt = `Analyze this LinkedIn post and predict its performance metrics.

Post format: ${format}
Post content:
"""
${content.trim()}
"""

Return a JSON object with:
- predicted_impressions: integer (realistic range for 5k-15k follower account)
- predicted_likes: integer
- predicted_comments: integer
- predicted_shares: integer
- engagement_rate: string (e.g. "3.2%")
- performance_score: integer 0-100
- strengths: array of 2-3 strings describing what works well
- improvements: array of 2-3 strings suggesting improvements
- best_time_to_post: string (e.g. "Tuesday 8-10am")
- hook_analysis: string (one sentence assessing the opening hook)

Base predictions on realistic LinkedIn data:
- Average engagement rate is 2-4%
- Strong hooks and questions increase comments by 2-3x
- Listicles get 20-30% more impressions
- Personal stories boost engagement by 40-60%`

    const result = await AI.openai.chat({
      prompt,
      system,
      model: 'gpt-4o-mini',
      maxTokens: 800,
      temperature: 0.2,
    })

    let prediction
    try {
      prediction = JSON.parse(result.content)
    } catch {
      return res.status(502).json({ error: 'AI returned invalid JSON' })
    }

    res.json({ prediction })
  } catch (err) {
    console.error('[content-suggestions] predict-performance error:', err.message)
    res.status(500).json({ error: 'Failed to predict performance' })
  }
})

// ── GET /api/content-suggestions/history ────────────────────────────────────
// List past generated suggestions for the current user
router.get('/api/content-suggestions/history', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const records = await ContentSuggestionRepo.findByUser(req.user.id, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    })
    res.json({ history: records })
  } catch (err) {
    console.error('[content-suggestions] history error:', err.message)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatHour(hour) {
  if (hour === 0) return '12:00 AM'
  if (hour < 12) return `${hour}:00 AM`
  if (hour === 12) return '12:00 PM'
  return `${hour - 12}:00 PM`
}

function scoreToConfidence(score) {
  if (score >= 80) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

module.exports = router
