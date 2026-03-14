const express = require('express')
const router = express.Router()

// Stub data
const templates = [
  { id: 1, name: 'Thought Leadership', category: 'engagement', type: 'text', content: 'Here\'s what nobody tells you about [TOPIC]:\n\n1. [INSIGHT 1]\n2. [INSIGHT 2]\n3. [INSIGHT 3]\n\nWhat\'s your experience with [TOPIC]?', uses: 128, created_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Personal Story', category: 'storytelling', type: 'text', content: '[TIME AGO], I [SITUATION].\n\nI had no idea it would change everything.\n\n[STORY BODY]\n\nThe lesson: [KEY TAKEAWAY]', uses: 94, created_at: '2025-01-02T00:00:00Z' },
  { id: 3, name: 'List Post', category: 'educational', type: 'text', content: '[NUMBER] things I wish I knew about [TOPIC]:\n\n→ [ITEM 1]\n→ [ITEM 2]\n→ [ITEM 3]\n→ [ITEM 4]\n→ [ITEM 5]\n\nSave this for later.', uses: 215, created_at: '2025-01-03T00:00:00Z' },
  { id: 4, name: 'Question Hook', category: 'engagement', type: 'text', content: 'Is [CONTROVERSIAL STATEMENT] actually true?\n\n[EXPLORATION]\n\nMy take: [YOUR OPINION]\n\nDo you agree?', uses: 67, created_at: '2025-01-04T00:00:00Z' },
]
let nextId = 5

// GET /api/templates
router.get('/api/templates', (req, res) => {
  const { category, q } = req.query
  let filtered = [...templates]
  if (category) filtered = filtered.filter(t => t.category === category)
  if (q) filtered = filtered.filter(t => t.name.toLowerCase().includes(q.toLowerCase()))
  res.json({ success: true, templates: filtered, meta: { total: filtered.length } })
})

// GET /api/templates/:id
router.get('/api/templates/:id', (req, res) => {
  const template = templates.find(t => t.id === parseInt(req.params.id))
  if (!template) return res.status(404).json({ success: false, error: 'Template not found' })
  res.json({ success: true, template })
})

// POST /api/templates
router.post('/api/templates', (req, res) => {
  const { name, category, type = 'text', content } = req.body
  if (!name || !content) return res.status(400).json({ success: false, error: 'name and content are required' })
  const template = { id: nextId++, name, category: category || 'general', type, content, uses: 0, created_at: new Date().toISOString() }
  templates.push(template)
  res.status(201).json({ success: true, template })
})

// PATCH /api/templates/:id
router.patch('/api/templates/:id', (req, res) => {
  const idx = templates.findIndex(t => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ success: false, error: 'Template not found' })
  const allowed = ['name', 'category', 'type', 'content']
  allowed.forEach(key => { if (req.body[key] !== undefined) templates[idx][key] = req.body[key] })
  templates[idx].updated_at = new Date().toISOString()
  res.json({ success: true, template: templates[idx] })
})

// DELETE /api/templates/:id
router.delete('/api/templates/:id', (req, res) => {
  const idx = templates.findIndex(t => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ success: false, error: 'Template not found' })
  templates.splice(idx, 1)
  res.json({ success: true, message: 'Template deleted successfully' })
})

module.exports = router
