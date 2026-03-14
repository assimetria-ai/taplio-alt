const express = require('express')
const router = express.Router()

// Stub data
const leads = [
  { id: 1, name: 'Sarah Johnson', title: 'VP of Marketing', company: 'TechCorp', linkedin_url: 'https://linkedin.com/in/sarahjohnson', status: 'warm', score: 85, notes: 'Engaged with 3 posts this month', last_interaction: '2025-01-18T10:00:00Z' },
  { id: 2, name: 'Michael Chen', title: 'Founder & CEO', company: 'StartupXYZ', linkedin_url: 'https://linkedin.com/in/michaelchen', status: 'hot', score: 92, notes: 'Commented on AI post, asked about pricing', last_interaction: '2025-01-19T14:30:00Z' },
  { id: 3, name: 'Emily Rodriguez', title: 'Head of Product', company: 'ScaleUp Inc', linkedin_url: 'https://linkedin.com/in/emilyrodriguez', status: 'cold', score: 41, notes: 'Liked one post', last_interaction: '2025-01-10T09:00:00Z' },
  { id: 4, name: 'David Kim', title: 'CTO', company: 'DevAgency', linkedin_url: 'https://linkedin.com/in/davidkim', status: 'warm', score: 73, notes: 'Shared my post on LinkedIn automation', last_interaction: '2025-01-17T16:00:00Z' },
]
let nextId = 5

// GET /api/leads
router.get('/api/leads', (req, res) => {
  const { status, q, sort = 'score', order = 'desc' } = req.query
  let filtered = [...leads]
  if (status) filtered = filtered.filter(l => l.status === status)
  if (q) filtered = filtered.filter(l =>
    l.name.toLowerCase().includes(q.toLowerCase()) ||
    l.company.toLowerCase().includes(q.toLowerCase())
  )
  filtered.sort((a, b) => order === 'desc' ? b[sort] - a[sort] : a[sort] - b[sort])
  res.json({ success: true, leads: filtered, meta: { total: filtered.length } })
})

// GET /api/leads/:id
router.get('/api/leads/:id', (req, res) => {
  const lead = leads.find(l => l.id === parseInt(req.params.id))
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' })
  res.json({ success: true, lead })
})

// POST /api/leads
router.post('/api/leads', (req, res) => {
  const { name, title, company, linkedin_url } = req.body
  if (!name) return res.status(400).json({ success: false, error: 'name is required' })
  const lead = { id: nextId++, name, title, company, linkedin_url, status: 'cold', score: 10, notes: '', last_interaction: new Date().toISOString() }
  leads.push(lead)
  res.status(201).json({ success: true, lead })
})

// PATCH /api/leads/:id
router.patch('/api/leads/:id', (req, res) => {
  const idx = leads.findIndex(l => l.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ success: false, error: 'Lead not found' })
  const allowed = ['name', 'title', 'company', 'linkedin_url', 'status', 'score', 'notes']
  allowed.forEach(key => { if (req.body[key] !== undefined) leads[idx][key] = req.body[key] })
  leads[idx].updated_at = new Date().toISOString()
  res.json({ success: true, lead: leads[idx] })
})

// DELETE /api/leads/:id
router.delete('/api/leads/:id', (req, res) => {
  const idx = leads.findIndex(l => l.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ success: false, error: 'Lead not found' })
  leads.splice(idx, 1)
  res.json({ success: true, message: 'Lead deleted successfully' })
})

module.exports = router
