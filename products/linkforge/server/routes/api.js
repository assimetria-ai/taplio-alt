// server/routes/api.js - Main API routes
// Task #10278 - Dashboard Links List UI
// Task #10314 - Bulk link import via CSV

const express = require('express');
const router = express.Router();
const linksRouter = require('./links');
const importRouter = require('./import');

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

// CSV import routes
router.use('/import', importRouter);

module.exports = router;
