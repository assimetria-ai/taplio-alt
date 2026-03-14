const express = require('express')
const router = express.Router()

// GET /api/linkedin-auth/connect — initiate OAuth flow
router.get('/api/linkedin-auth/connect', (req, res) => {
  // Stub: in production this redirects to LinkedIn OAuth
  res.json({
    success: true,
    auth_url: 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=STUB&scope=w_member_social',
    message: 'Redirect user to auth_url to connect LinkedIn',
  })
})

// GET /api/linkedin-auth/callback — OAuth callback
router.get('/api/linkedin-auth/callback', (req, res) => {
  const { code } = req.query
  if (!code) return res.status(400).json({ success: false, error: 'Missing authorization code' })
  // Stub: exchange code for token
  res.json({
    success: true,
    message: 'LinkedIn account connected successfully',
    profile: {
      id: 'li_stub_123',
      name: 'Demo User',
      headline: 'Building cool things on LinkedIn',
      picture_url: null,
    },
  })
})

// GET /api/linkedin-auth/status
router.get('/api/linkedin-auth/status', (req, res) => {
  res.json({
    success: true,
    connected: true,
    profile: {
      id: 'li_stub_123',
      name: 'Demo User',
      headline: 'Building cool things on LinkedIn',
    },
    token_expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
  })
})

// DELETE /api/linkedin-auth/disconnect
router.delete('/api/linkedin-auth/disconnect', (req, res) => {
  res.json({ success: true, message: 'LinkedIn account disconnected' })
})

module.exports = router
