/**
 * @custom AIContentEngine
 * Service layer for AI-powered LinkedIn content generation.
 * Wraps @system/AI with product-specific prompts and structured response shaping.
 *
 * Usage:
 *   const AIContentEngine = require('../lib/@custom/AIContentEngine')
 *   const { suggestions } = await AIContentEngine.generatePostIdeas(topic, tone, length, format, industry)
 */

const AI = require('../@system/AI')

// ── Prompt configuration constants ────────────────────────────────────────────

const TONE_DESCRIPTIONS = {
  professional:
    'authoritative, polished, and data-driven. Suitable for executives and decision-makers.',
  casual:
    'conversational, warm, and relatable. Feels like advice from a trusted colleague.',
  bold:
    'provocative, direct, and attention-grabbing. Makes a strong stance or challenges conventional wisdom.',
}

const LENGTH_GUIDES = {
  short:  { words: '80–150',   description: 'punchy and scannable' },
  medium: { words: '150–250',  description: 'balanced depth and readability' },
  long:   { words: '250–400',  description: 'comprehensive with storytelling and detail' },
}

const FORMAT_GUIDES = {
  text:     'Flowing prose paragraphs. No bullet points or numbering.',
  listicle: 'Numbered or bulleted list (e.g., "5 things I learned..."). Clear header + concise list items.',
  story:    'First-person narrative arc: hook → conflict/challenge → resolution → lesson learned.',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Parse JSON from an OpenAI response, stripping accidental markdown fences.
 * @throws {Error} if the content cannot be parsed as JSON
 */
function parseJSON(raw) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  return JSON.parse(cleaned)
}

// ── Service ────────────────────────────────────────────────────────────────────

const AIContentEngine = {
  /**
   * Generate 3 LinkedIn post ideas for a given topic.
   *
   * @param {string}  topic       - Core topic or theme (required)
   * @param {string}  [tone]      - 'professional' | 'casual' | 'bold'
   * @param {string}  [length]    - 'short' | 'medium' | 'long'
   * @param {string}  [format]    - 'text' | 'listicle' | 'story'
   * @param {string}  [industry]  - Industry context for tailored prompts
   * @returns {Promise<{ suggestions: Array, model: string, tokensUsed: number }>}
   */
  async generatePostIdeas(
    topic,
    tone = 'professional',
    length = 'medium',
    format = 'text',
    industry,
  ) {
    const toneDesc    = TONE_DESCRIPTIONS[tone]    ?? TONE_DESCRIPTIONS.professional
    const lengthGuide = LENGTH_GUIDES[length]      ?? LENGTH_GUIDES.medium
    const formatGuide = FORMAT_GUIDES[format]      ?? FORMAT_GUIDES.text
    const industryCtx = industry ? `Industry context: ${industry}` : ''

    const system = `You are an elite LinkedIn content strategist who crafts viral B2B posts.
You understand what resonates on LinkedIn: personal stories, bold takes, actionable insights, and strong hooks.
Always respond with valid JSON only — no markdown, no extra text.`

    const prompt = `Generate exactly 3 LinkedIn post ideas on the following topic.

Topic: ${topic}
${industryCtx}
Tone: ${toneDesc}
Length: ${lengthGuide.words} words (${lengthGuide.description})
Format: ${formatGuide}

Return a JSON array of exactly 3 objects. Each object must have:
- title: short internal headline describing the angle (max 80 chars, NOT the first line of the post)
- hook: the opening 1-2 sentences — must grab attention immediately
- content: full post draft matching the specified format and length
- hashtags: array of 5-7 relevant hashtags (without #)
- call_to_action: the closing question or CTA sentence
- estimated_engagement: { impressions: number, likes: number, comments: number, shares: number, engagement_rate: string }

Vary the angles across the 3 ideas (e.g., personal story, data insight, controversial take).
Base engagement estimates on a 5k–15k follower LinkedIn account.`

    const result = await AI.openai.chat({
      prompt,
      system,
      model: 'gpt-4o-mini',
      maxTokens: 2500,
      temperature: 0.85,
    })

    const suggestions = parseJSON(result.content)
    if (!Array.isArray(suggestions)) throw new Error('AI returned unexpected format for generatePostIdeas')

    return {
      suggestions: suggestions.slice(0, 3),
      model: result.model,
      tokensUsed: result.usage?.total_tokens ?? 0,
    }
  },

  /**
   * Suggest optimal LinkedIn posting windows for a timezone and industry.
   *
   * @param {string}  [timezone]  - IANA timezone string (e.g., 'America/New_York')
   * @param {string}  [industry]  - Industry context for tailored recommendations
   * @returns {Promise<{ slots: Array, model: string, tokensUsed: number }>}
   */
  async suggestOptimalTimes(timezone = 'UTC', industry) {
    const industryCtx = industry
      ? `The user works in the ${industry} industry. Tailor recommendations to when their target audience is most active on LinkedIn.`
      : 'Provide general LinkedIn engagement pattern recommendations.'

    const system = `You are a LinkedIn analytics expert with deep knowledge of posting time research.
Always respond with valid JSON only — no markdown, no extra text.`

    const prompt = `Suggest the 7 optimal LinkedIn posting time windows for maximum engagement.

Timezone: ${timezone}
${industryCtx}

Return a JSON array of exactly 7 objects, each with:
- day_of_week: integer 0-6 (0=Sunday, 6=Saturday)
- day_name: string (e.g., "Tuesday")
- hour: integer 0-23 (hour in the given timezone)
- time_label: human-readable (e.g., "8:00 AM")
- score: float 0-100 (engagement confidence)
- audience: one sentence on who is most active at this time
- rationale: one sentence explaining the recommendation

Guidelines:
- Weekdays (Tue–Thu) typically outperform weekends
- 7-9am catches commuters, 12-1pm catches lunch scrollers, 5-6pm catches end-of-day
- B2B audiences peak during business hours
- Tech/startup audiences are also active early morning and late evening`

    const result = await AI.openai.chat({
      prompt,
      system,
      model: 'gpt-4o-mini',
      maxTokens: 1200,
      temperature: 0.2,
    })

    const slots = parseJSON(result.content)
    if (!Array.isArray(slots)) throw new Error('AI returned unexpected format for suggestOptimalTimes')

    return {
      slots: slots.slice(0, 7),
      model: result.model,
      tokensUsed: result.usage?.total_tokens ?? 0,
    }
  },

  /**
   * Predict engagement performance for a LinkedIn post.
   *
   * @param {string}  content      - Post content to analyze (required)
   * @param {string}  [format]     - 'text' | 'listicle' | 'story'
   * @returns {Promise<{ prediction: object, model: string, tokensUsed: number }>}
   */
  async predictPerformance(content, format = 'text') {
    const system = `You are a LinkedIn content performance analyst with access to engagement benchmarks.
You analyze posts objectively and give specific, actionable feedback.
Always respond with valid JSON only — no markdown, no extra text.`

    const prompt = `Analyze this LinkedIn post and predict its performance.

Post format: ${format}
Post content:
"""
${content.trim()}
"""

Return a JSON object with:
- predicted_impressions: integer (realistic for 5k–15k followers)
- predicted_likes: integer
- predicted_comments: integer
- predicted_shares: integer
- engagement_rate: string (e.g., "3.4%")
- performance_score: integer 0-100
- grade: "A" | "B" | "C" | "D"
- strengths: array of exactly 3 specific observations about what works
- improvements: array of exactly 3 actionable improvement suggestions
- hook_score: integer 0-100 (strength of the opening line)
- hook_analysis: one sentence assessing the opening hook
- best_time_to_post: string (e.g., "Tuesday 8-9am")
- readability_score: integer 0-100
- virality_factors: array of elements that could drive shares

LinkedIn benchmarks for context:
- Average engagement rate: 2-4%
- Listicles get ~25% more impressions than plain text
- Personal stories boost engagement by 40-60%
- Posts with questions in CTAs get 2x more comments
- Posts under 1300 characters have higher completion rates`

    const result = await AI.openai.chat({
      prompt,
      system,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.15,
    })

    const prediction = parseJSON(result.content)
    if (typeof prediction !== 'object' || Array.isArray(prediction)) {
      throw new Error('AI returned unexpected format for predictPerformance')
    }

    return {
      prediction,
      model: result.model,
      tokensUsed: result.usage?.total_tokens ?? 0,
    }
  },

  /**
   * Generate optimised LinkedIn hashtags for content.
   *
   * @param {string}  content   - Post content or topic description (required)
   * @param {number}  [count]   - Total hashtags to return (default: 8, max: 15)
   * @returns {Promise<{ hashtags: string[], categorized: object, reach_estimate: string|null, model: string, tokensUsed: number }>}
   */
  async generateHashtags(content, count = 8) {
    const safeCount = Math.min(Math.max(parseInt(count, 10) || 8, 3), 15)

    const system = `You are a LinkedIn hashtag strategist who knows which tags actually drive impressions.
Always respond with valid JSON only — no markdown, no extra text.`

    const prompt = `Generate optimal LinkedIn hashtags for this content.

Content:
"""
${content.trim().slice(0, 1000)}
"""

Return a JSON object with:
- hashtags: array of exactly ${safeCount} hashtag strings (without the # symbol), sorted by relevance
- categorized: {
    niche: array of 2-3 specific tags (10k–100k followers),
    industry: array of 2-3 mid-size tags (100k–1M followers),
    broad: array of 2-3 high-volume tags (1M+ followers)
  }
- reach_estimate: string describing approximate combined weekly reach (e.g., "~2M weekly impressions")

Rules:
- Avoid generic filler like "success", "motivation", "hustle" unless directly on-topic
- All lowercase, no spaces or special characters
- Mix specificity levels for best algorithm reach`

    const result = await AI.openai.chat({
      prompt,
      system,
      model: 'gpt-4o-mini',
      maxTokens: 500,
      temperature: 0.3,
    })

    const data = parseJSON(result.content)

    return {
      hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
      categorized: data.categorized || {},
      reach_estimate: data.reach_estimate || null,
      model: result.model,
      tokensUsed: result.usage?.total_tokens ?? 0,
    }
  },
}

module.exports = AIContentEngine
