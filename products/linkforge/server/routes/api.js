// server/routes/api.js - Main API routes
// Task #10278 - Dashboard Links List UI

const express = require('express');
const router = express.Router();
const linksRouter = require('./links');

// Health check
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'LinkForge API v1.0',
    timestamp: new Date().toISOString()
  });
});

// Links management routes
router.use('/links', linksRouter);

module.exports = router;
