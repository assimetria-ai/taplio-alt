// server/index.js - LinkForge Express Server

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

const redirectRouter = require('./routes/redirect');
const apiRouter = require('./routes/api');
const conversionsRouter = require('./routes/conversions');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Trust proxy for accurate IP addresses behind reverse proxies
app.set('trust proxy', true);

// Make Prisma available to routes
app.locals.prisma = prisma;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes (future: /api/links, /api/auth, etc.)
app.use('/api', apiRouter);
app.use('/api', conversionsRouter);

// Redirect handler - MUST be last to catch all slugs
app.use('/', redirectRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔗 LinkForge server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
