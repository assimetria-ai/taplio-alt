'use strict'

/**
 * OpenAI API wrapper for Taplio Alt content suggestion features.
 *
 * Falls back to mock data when OPENAI_API_KEY is not set so the UI
 * remains fully functional in development without a key.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const DEFAULT_MODEL = 'gpt-4o-mini'

// ── Simple in-process rate limiter ────────────────────────────────────────────

const RATE_LIMIT = { maxPerMinute: 60 }
let _requestCount = 0
let _windowStart = Date.now()

function _checkRateLimit() {
  const now = Date.now()
  if (now - _windowStart > 60_000) {
    _requestCount = 0
    _windowStart = now
  }
  if (_requestCount >= RATE_LIMIT.maxPerMinute) {
    throw Object.assign(new Error('Rate limit exceeded — please wait a moment and try again.'), {
      code: 'RATE_LIMIT',
    })
  }
  _requestCount++
}

// ── Low-level OpenAI call ─────────────────────────────────────────────────────

async function _chat(messages, options = {}) {
  _checkRateLimit()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 1500,
    }),
  })

  if (!response.ok) {
    let errMsg = `OpenAI API error ${response.status}`
    try {
      const body = await response.json()
      errMsg = body.error?.message || errMsg
    } catch { /* ignore */ }
    throw new Error(errMsg)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_IDEAS = [
  {
    title: '5 Lessons Nobody Tells You About Building a B2B Startup',
    content: `I spent 3 years building a B2B startup from zero to acquisition.

Here are 5 hard-won lessons that changed everything:

1. Talk to 50 customers before writing a single line of code
2. Distribution beats product in the first 18 months
3. Revenue is the only vanity metric worth chasing
4. Your first hire defines your culture — choose carefully
5. Move fast, but document every decision

The founders who succeed aren't the most talented. They're the most persistent.

What lesson took you the longest to learn?

#startups #entrepreneurship #b2b #leadership #saas`,
    hashtags: ['startups', 'entrepreneurship', 'b2b', 'leadership', 'saas'],
    format: 'listicle',
    estimated_engagement: { impressions: 4200, likes: 187, comments: 43, engagement_rate: '5.5%' },
  },
  {
    title: 'The Counterintuitive Truth About Deep Work',
    content: `Hot take: working more hours is actively destroying your output.

I used to grind 80-hour weeks. My results? Mediocre at best.

Then I switched to:
→ 4 focused deep-work blocks per day
→ Hard stop at 6 pm — no exceptions
→ One north-star priority every morning

Result: 3× more meaningful output in 40 hours.

The best performers aren't the most available. They're the most intentional.

Are you optimising for hours logged or outcomes delivered?

#productivity #leadership #deepwork #focus #worklife`,
    hashtags: ['productivity', 'leadership', 'deepwork', 'focus', 'worklife'],
    format: 'hot_take',
    estimated_engagement: { impressions: 6800, likes: 312, comments: 78, engagement_rate: '5.7%' },
  },
  {
    title: 'How I Grew My LinkedIn to 10k Followers in 90 Days',
    content: `90 days ago I had 800 LinkedIn followers.

Today: 10,400.

Here's the exact playbook — no courses, no paid ads:

Step 1: Post at 7 am Tuesday–Thursday (engagement spikes 40% earlier)
Step 2: Lead with a bold, controversial first line
Step 3: Use line breaks aggressively — walls of text get skipped
Step 4: End every post with a genuine question
Step 5: Comment thoughtfully on 5 posts before publishing your own

Consistency > virality. Every. Single. Time.

Which of these will you try first?

#linkedin #contentcreator #growthhacking #personalbranding #socialmedia`,
    hashtags: ['linkedin', 'contentcreator', 'growthhacking', 'personalbranding', 'socialmedia'],
    format: 'how_to',
    estimated_engagement: { impressions: 9100, likes: 445, comments: 112, engagement_rate: '6.1%' },
  },
  {
    title: 'The Day I Almost Quit — And What Stopped Me',
    content: `Two years into my startup I was ready to walk away.

We'd missed our revenue target three quarters in a row. Two key engineers quit the same week. An investor pulled their term sheet two days before we were supposed to sign.

I sat in my car in the parking garage for an hour.

Then I called our first customer — the one who'd taken a chance on us in month one.

She said: "Don't you dare quit. You fixed a problem that was costing us $40k a year."

I went back upstairs and got to work.

Six months later we closed our Series A.

The best thing about hitting rock bottom is that the floor is solid.

Has a customer ever saved your startup?

#startup #entrepreneurship #resilience #founder #mindset`,
    hashtags: ['startup', 'entrepreneurship', 'resilience', 'founder', 'mindset'],
    format: 'story',
    estimated_engagement: { impressions: 11200, likes: 632, comments: 189, engagement_rate: '7.3%' },
  },
  {
    title: 'AI Will Not Replace You — But This Might',
    content: `Everyone is worried AI will take their job.

The real threat? The person sitting next to you who's using AI every day.

In 2024 the productivity gap between AI-fluent and AI-resistant professionals widened by 47% (McKinsey).

Here's what top performers are doing:
• Using AI to compress 4 hours of research into 20 minutes
• Iterating on copy and strategy 10× faster
• Delegating repetitive tasks so they can focus on high-leverage thinking

AI doesn't replace skills. It amplifies them.

Are you on the right side of this divide?

#ai #futureofwork #productivity #technology #leadership`,
    hashtags: ['ai', 'futureofwork', 'productivity', 'technology', 'leadership'],
    format: 'text_post',
    estimated_engagement: { impressions: 8400, likes: 367, comments: 94, engagement_rate: '5.5%' },
  },
]

const MOCK_PERFORMANCE = {
  predicted_impressions: 3200,
  predicted_likes: 145,
  predicted_comments: 32,
  predicted_shares: 18,
  engagement_rate: '3.8%',
  performance_score: 72,
  strengths: [
    'Strong opening hook that creates immediate curiosity',
    'Clear call-to-action with an engaging question at the end',
    'Good use of line breaks for mobile readability',
  ],
  improvements: [
    'Add a personal story element to increase emotional connection',
    'Consider a numbered list format to boost shareability',
  ],
  best_time_to_post: 'Tuesday or Wednesday, 8–10 am',
  hook_analysis: 'The opening line makes a bold claim that compels readers to keep going.',
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Generate LinkedIn post ideas.
 *
 * @param {string} industry
 * @param {string[]} topics
 * @param {'professional'|'casual'|'bold'} tone
 * @param {number} count
 * @returns {Promise<Array>}
 */
async function generatePostIdeas(industry, topics, tone, count) {
  const safeCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10)
  const topicsText =
    Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'general professional topics'

  if (!OPENAI_API_KEY) {
    const mocked = []
    for (let i = 0; i < safeCount; i++) {
      const base = MOCK_IDEAS[i % MOCK_IDEAS.length]
      mocked.push({ ...base, title: `${base.title} (${i + 1})` })
    }
    return mocked
  }

  const messages = [
    {
      role: 'system',
      content:
        'You are a LinkedIn content strategist specialising in viral B2B posts. ' +
        'Always respond with valid JSON only — no markdown fences, no extra text.',
    },
    {
      role: 'user',
      content:
        `Generate ${safeCount} LinkedIn post ideas for the ${industry || 'professional'} industry.\n` +
        `Topics: ${topicsText}\n` +
        `Tone: ${tone || 'professional'}\n\n` +
        `Return a JSON array of exactly ${safeCount} objects. Each object must have:\n` +
        `- title: short headline (max 80 chars)\n` +
        `- content: full LinkedIn post draft (150-300 words, line breaks, ends with a question)\n` +
        `- hashtags: array of 4-6 relevant hashtags (without the # symbol)\n` +
        `- format: one of "text_post" | "listicle" | "story" | "how_to" | "hot_take" | "carousel_outline"\n` +
        `- estimated_engagement: { impressions: number, likes: number, comments: number, engagement_rate: string }\n\n` +
        `Engagement should be realistic for a mid-sized LinkedIn account (5k–15k followers).`,
    },
  ]

  const raw = await _chat(messages, { temperature: 0.8, maxTokens: 3000 })

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    return parsed
  } catch {
    throw new Error('AI returned invalid JSON for post ideas')
  }
}

/**
 * Predict performance metrics for a LinkedIn post.
 *
 * @param {string} content
 * @param {string} [industry]
 * @returns {Promise<Object>}
 */
async function predictPerformance(content, industry) {
  if (!content || !content.trim()) throw new Error('Content is required')

  if (!OPENAI_API_KEY) {
    return { ...MOCK_PERFORMANCE }
  }

  const messages = [
    {
      role: 'system',
      content:
        'You are a LinkedIn analytics expert who predicts post performance from content analysis. ' +
        'Respond with valid JSON only — no markdown fences, no extra text.',
    },
    {
      role: 'user',
      content:
        `Analyse this LinkedIn post and predict its performance metrics.\n` +
        `Industry context: ${industry || 'general professional'}\n\n` +
        `Post content:\n"""\n${content.trim()}\n"""\n\n` +
        `Return a JSON object with:\n` +
        `- predicted_impressions: integer (realistic for 5k-15k followers)\n` +
        `- predicted_likes: integer\n` +
        `- predicted_comments: integer\n` +
        `- predicted_shares: integer\n` +
        `- engagement_rate: string e.g. "3.2%"\n` +
        `- performance_score: integer 0-100\n` +
        `- strengths: array of 2-3 strings\n` +
        `- improvements: array of 2-3 strings\n` +
        `- best_time_to_post: string e.g. "Tuesday 8-10am"\n` +
        `- hook_analysis: one sentence assessing the opening hook`,
    },
  ]

  const raw = await _chat(messages, { temperature: 0.2, maxTokens: 800 })

  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('AI returned invalid JSON for performance prediction')
  }
}

// ── Optimal posting times ─────────────────────────────────────────────────────
// Sourced from LinkedIn engagement research (Hootsuite / Sprout Social benchmarks).

const TIMES_BY_INDUSTRY = {
  technology: [
    { day: 'Tuesday',   time: '9:00 AM',  engagementScore: 95 },
    { day: 'Wednesday', time: '8:00 AM',  engagementScore: 91 },
    { day: 'Thursday',  time: '10:00 AM', engagementScore: 88 },
    { day: 'Monday',    time: '9:00 AM',  engagementScore: 83 },
    { day: 'Wednesday', time: '12:00 PM', engagementScore: 79 },
    { day: 'Tuesday',   time: '5:00 PM',  engagementScore: 74 },
    { day: 'Friday',    time: '8:00 AM',  engagementScore: 65 },
  ],
  marketing: [
    { day: 'Wednesday', time: '9:00 AM',  engagementScore: 94 },
    { day: 'Tuesday',   time: '10:00 AM', engagementScore: 90 },
    { day: 'Thursday',  time: '8:00 AM',  engagementScore: 86 },
    { day: 'Monday',    time: '10:00 AM', engagementScore: 81 },
    { day: 'Friday',    time: '9:00 AM',  engagementScore: 72 },
    { day: 'Wednesday', time: '5:00 PM',  engagementScore: 67 },
    { day: 'Tuesday',   time: '12:00 PM', engagementScore: 63 },
  ],
  finance: [
    { day: 'Tuesday',   time: '7:00 AM',  engagementScore: 93 },
    { day: 'Wednesday', time: '7:00 AM',  engagementScore: 90 },
    { day: 'Thursday',  time: '7:00 AM',  engagementScore: 87 },
    { day: 'Monday',    time: '7:00 AM',  engagementScore: 84 },
    { day: 'Tuesday',   time: '12:00 PM', engagementScore: 76 },
    { day: 'Wednesday', time: '4:00 PM',  engagementScore: 70 },
    { day: 'Friday',    time: '8:00 AM',  engagementScore: 62 },
  ],
  healthcare: [
    { day: 'Wednesday', time: '7:00 AM',  engagementScore: 91 },
    { day: 'Tuesday',   time: '7:00 AM',  engagementScore: 88 },
    { day: 'Thursday',  time: '8:00 AM',  engagementScore: 85 },
    { day: 'Monday',    time: '8:00 AM',  engagementScore: 80 },
    { day: 'Tuesday',   time: '12:00 PM', engagementScore: 74 },
    { day: 'Friday',    time: '7:00 AM',  engagementScore: 66 },
    { day: 'Wednesday', time: '5:00 PM',  engagementScore: 60 },
  ],
  education: [
    { day: 'Tuesday',   time: '8:00 AM',  engagementScore: 90 },
    { day: 'Wednesday', time: '9:00 AM',  engagementScore: 87 },
    { day: 'Thursday',  time: '8:00 AM',  engagementScore: 84 },
    { day: 'Monday',    time: '9:00 AM',  engagementScore: 79 },
    { day: 'Tuesday',   time: '12:00 PM', engagementScore: 73 },
    { day: 'Friday',    time: '8:00 AM',  engagementScore: 65 },
    { day: 'Wednesday', time: '5:00 PM',  engagementScore: 58 },
  ],
  default: [
    { day: 'Tuesday',   time: '8:00 AM',  engagementScore: 92 },
    { day: 'Wednesday', time: '10:00 AM', engagementScore: 89 },
    { day: 'Thursday',  time: '9:00 AM',  engagementScore: 87 },
    { day: 'Monday',    time: '8:00 AM',  engagementScore: 82 },
    { day: 'Tuesday',   time: '12:00 PM', engagementScore: 80 },
    { day: 'Wednesday', time: '5:00 PM',  engagementScore: 75 },
    { day: 'Friday',    time: '9:00 AM',  engagementScore: 68 },
  ],
}

/**
 * Return optimal LinkedIn posting time slots for a given industry.
 *
 * Uses research-backed benchmarks (Hootsuite / Sprout Social). When
 * OPENAI_API_KEY is set and the industry is not in the lookup table the
 * function falls back to the default slots rather than calling the API,
 * since engagement timing is empirical data, not generative content.
 *
 * @param {string} [industry]
 * @param {string} [timezone]  - informational only; returned as-is
 * @returns {Promise<{ slots: Array, timezone: string }>}
 */
async function getOptimalTimes(industry, timezone = 'UTC') {
  const key = industry ? industry.toLowerCase().trim().replace(/\s+/g, '') : null
  const slots = (key && TIMES_BY_INDUSTRY[key]) ? TIMES_BY_INDUSTRY[key] : TIMES_BY_INDUSTRY.default
  return { slots, timezone }
}

module.exports = { generatePostIdeas, predictPerformance, getOptimalTimes }
