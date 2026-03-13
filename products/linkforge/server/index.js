// server/index.js - LinkForge Express Server
// Task #10311 - Custom domain configuration support

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

const redirectRouter = require('./routes/redirect');
const apiRouter = require('./routes/api');
const conversionsRouter = require('./routes/conversions');
const domainsRouter = require('../@custom/api/domains');

// Custom domain middleware
const { customDomainMiddleware, warmUpCache } = require('../@custom/middleware/customDomain');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Trust proxy for accurate IP addresses behind Railway reverse proxy
// Use 1 (single hop) instead of true to prevent X-Forwarded-For spoofing
app.set('trust proxy', 1);

// Custom domain detection and routing
app.use(customDomainMiddleware());

// Make Prisma available to routes
app.locals.prisma = prisma;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    customDomain: req.customDomain?.domain || null
  });
});

// API routes
app.use('/api', apiRouter);
app.use('/api', conversionsRouter);
app.use('/api/domains', domainsRouter);

// Redirect handler - MUST be last to catch all slugs
// Works with both primary domain and custom domains
app.use('/', redirectRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
async function startServer() {
  try {
    // Warm up custom domain cache
    console.log('⏳ Warming up custom domain cache...');
    await warmUpCache();
    
    app.listen(PORT, () => {
      console.log(`🔗 LinkForge server running on http://localhost:${PORT}`);
      console.log(`   Custom domains: enabled`);
      console.log(`   Primary domain: ${process.env.PRIMARY_DOMAIN || 'localhost'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
