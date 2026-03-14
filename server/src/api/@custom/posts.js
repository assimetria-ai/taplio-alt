const express = require('express')
const router = express.Router()

// Stub data
const posts = [
  { id: 1, content: 'Excited to share my thoughts on AI trends in 2025 🚀', status: 'published', scheduled_at: null, likes: 142, comments: 23, shares: 18, created_at: '2025-01-10T10:00:00Z' },
  { id: 2, content: '5 LinkedIn tips that doubled my connection rate this quarter', status: 'scheduled', scheduled_at: '2025-02-01T09:00:00Z', likes: 0, comments: 0, shares: 0, created_at: '2025-01-15T14:30:00Z' },
  { id: 3, content: 'Why I stopped chasing vanity metrics on LinkedIn', status: 'draft', scheduled_at: null, likes: 0, comments: 0, shares: 0, created_at: '2025-01-18T08:00:00Z' },
]
let nextId = 4

// GET /api/posts
router.get('/api/posts', (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  let filtered = status ? posts.filter(p => p.status === status) : [...posts]
  const total = filtered.length
  const offset = (parseInt(page) - 1) * parseInt(limit)
  filtered = filtered.slice(offset, offset + parseInt(limit))
  res.json({ success: true, posts: filtered, meta: { total, page: parseInt(page), limit: parseInt(limit) } })
})

// GET /api/posts/:id
router.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id))
  if (!post) return res.status(404).json({ success: false, error: 'Post not found' })
  res.json({ success: true, post })
})

// POST /api/posts
router.post('/api/posts', (req, res) => {
  const { content, status = 'draft', scheduled_at = null } = req.body
  if (!content) return res.status(400).json({ success: false, error: 'content is required' })
  const post = { id: nextId++, content, status, scheduled_at, likes: 0, comments: 0, shares: 0, created_at: new Date().toISOString() }
  posts.push(post)
  res.status(201).json({ success: true, post })
})

// PATCH /api/posts/:id
router.patch('/api/posts/:id', (req, res) => {
  const idx = posts.findIndex(p => p.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ success: false, error: 'Post not found' })
  const allowed = ['content', 'status', 'scheduled_at']
  allowed.forEach(key => { if (req.body[key] !== undefined) posts[idx][key] = req.body[key] })
  posts[idx].updated_at = new Date().toISOString()
  res.json({ success: true, post: posts[idx] })
})

// DELETE /api/posts/:id
router.delete('/api/posts/:id', (req, res) => {
  const idx = posts.findIndex(p => p.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ success: false, error: 'Post not found' })
  posts.splice(idx, 1)
  res.json({ success: true, message: 'Post deleted successfully' })
})

// POST /api/posts/:id/publish
router.post('/api/posts/:id/publish', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id))
  if (!post) return res.status(404).json({ success: false, error: 'Post not found' })
  post.status = 'published'
  post.published_at = new Date().toISOString()
  res.json({ success: true, post, message: 'Post published to LinkedIn' })
})

module.exports = router
