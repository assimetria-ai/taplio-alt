// server/index.js - Main server entry point
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const securityHeaders = require('./middleware/security');

// Import API routes
const { router: authRouter } = require('../@custom/api/auth');
const projectsRouter = require('../@custom/api/projects');
const tasksRouter = require('../@custom/api/tasks');
const dashboardRouter = require('../@custom/api/dashboard');
const teamRouter = require('../@custom/api/team');
const userRouter = require('../@custom/api/user');
const workspaceRouter = require('../@custom/api/workspace');
const csvUploadRouter = require('../@custom/api/csv-upload');
const ogImageRouter = require('../@custom/api/og-image');
const timeTrackingRouter = require('../@custom/api/time-tracking');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers (CSP for XSS protection) - must be first
app.use(securityHeaders);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/team', teamRouter);
app.use('/api/user', userRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/csv-upload', csvUploadRouter);
app.use('/api/og-image', ogImageRouter);
app.use('/api/time', timeTrackingRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Planora server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API: http://localhost:${PORT}/api`);
});

module.exports = app;
