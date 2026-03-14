const express = require('express')
const router = express.Router()

const STUB_POSTS = [
  'Just had a breakthrough realization about [TOPIC]: the secret isn\'t working harder — it\'s working on the right things.\n\nHere\'s what I learned after [TIMEFRAME]:\n\n→ [INSIGHT 1]\n→ [INSIGHT 2]\n→ [INSIGHT 3]\n\nWhat\'s your biggest lesson from [TOPIC]?',
  'Unpopular opinion: [STATEMENT].\n\nI know this contradicts conventional wisdom, but here\'s why I believe it:\n\n[REASONING]\n\nThe data backs this up: [EVIDENCE]\n\nAgree or disagree? Let me know in the comments 👇',
  'I made a mistake that cost me [CONSEQUENCE].\n\nHere\'s the full story — and what I\'d do differently:\n\n[STORY]\n\nThe lesson: [TAKEAWAY]\n\nHope this saves someone else from the same mistake.',
]

// POST /api/ai-generate
router.post('/api/ai-generate', (req, res) => {
  const { topic, tone = 'professional', type = 'thought-leadership', context } = req.body
  if (!topic) return res.status(400).json({ success: false, error: 'topic is required' })

  const template = STUB_POSTS[Math.floor(Math.random() * STUB_POSTS.length)]
  const content = template.replace(/\[TOPIC\]/g, topic)

  res.json({
    success: true,
    generated: {
      content,
      tone,
      type,
      word_count: content.split(' ').length,
      estimated_read_time: '45 seconds',
      hashtag_suggestions: [`#${topic.replace(/\s+/g, '')}`, '#LinkedIn', '#Growth', '#PersonalBrand'],
      best_time_to_post: 'Tuesday 9am',
    },
    usage: { tokens_used: 312, model: 'gpt-4o-mini' },
  })
})

// POST /api/ai-generate/improve
router.post('/api/ai-generate/improve', (req, res) => {
  const { content, instruction } = req.body
  if (!content) return res.status(400).json({ success: false, error: 'content is required' })

  res.json({
    success: true,
    original: content,
    improved: content + '\n\n[AI improved version would appear here based on: ' + (instruction || 'general improvements') + ']',
    changes: ['Added stronger hook', 'Improved call-to-action', 'Optimized for engagement'],
  })
})

// GET /api/ai-generate/ideas
router.get('/api/ai-generate/ideas', (req, res) => {
  const { niche = 'general' } = req.query
  res.json({
    success: true,
    niche,
    ideas: [
      { title: 'Share a contrarian take on a trending topic', type: 'thought-leadership', estimated_engagement: 'high' },
      { title: 'Behind-the-scenes look at your work process', type: 'storytelling', estimated_engagement: 'medium' },
      { title: 'Lessons learned from a recent failure', type: 'personal', estimated_engagement: 'very-high' },
      { title: '5 tools that changed your workflow', type: 'educational', estimated_engagement: 'medium' },
      { title: 'Ask your audience a thought-provoking question', type: 'engagement', estimated_engagement: 'high' },
    ],
  })
})

module.exports = router
