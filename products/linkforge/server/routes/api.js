// server/routes/api.js - API routes placeholder

const express = require('express');
const router = express.Router();

// Placeholder for future API routes
// POST /api/links - Create link
// GET /api/links - List links
// GET /api/links/:id - Get link details
// GET /api/links/:id/analytics - Get link analytics
// DELETE /api/links/:id - Delete link

router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'LinkForge API v1.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
