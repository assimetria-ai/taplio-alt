const express = require('express')
const router = express.Router()

// GET /api/analytics
router.get('/api/analytics', (req, res) => {
  const { period = '30d' } = req.query
  res.json({
    success: true,
    period,
    summary: {
      impressions: 48320,
      impressions_change: 12.4,
      likes: 1842,
      likes_change: 8.7,
      comments: 394,
      comments_change: 15.2,
      shares: 218,
      shares_change: -3.1,
      followers_gained: 142,
      followers_change: 22.5,
      engagement_rate: 4.8,
      engagement_rate_change: 0.6,
    },
    chart: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
      impressions: Math.floor(800 + Math.random() * 1200),
      likes: Math.floor(40 + Math.random() * 80),
      comments: Math.floor(8 + Math.random() * 20),
    })),
    top_posts: [
      { id: 1, content: 'Excited to share my thoughts on AI trends in 2025 🚀', impressions: 8420, likes: 142, comments: 23 },
      { id: 2, content: '5 LinkedIn tips that doubled my connection rate', impressions: 6150, likes: 98, comments: 41 },
      { id: 3, content: 'Why I stopped chasing vanity metrics', impressions: 5890, likes: 87, comments: 19 },
    ],
    best_time: { hour: 9, day: 'Tuesday', label: 'Tuesday 9am' },
  })
})

// GET /api/analytics/posts/:id
router.get('/api/analytics/posts/:id', (req, res) => {
  res.json({
    success: true,
    post_id: parseInt(req.params.id),
    impressions: 8420,
    likes: 142,
    comments: 23,
    shares: 18,
    clicks: 312,
    engagement_rate: 4.8,
    reach: 7100,
  })
})

module.exports = router
