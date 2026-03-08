/**
 * Nestora Backend API Server
 * Task #9680: Property listing core feature
 * 
 * Express application with property management endpoints
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');

// Import routes
const propertiesRouter = require('./routes/properties');
const tenantsRouter = require('./routes/tenants');
const paymentsRouter = require('./routes/payments');
const maintenanceRouter = require('./routes/maintenance');

const app = express();

// Initialize database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded photos
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// API Routes
app.use('/api/properties', propertiesRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/maintenance', maintenanceRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`✅ Nestora API server running on port ${PORT}`);
    console.log(`📍 API base: http://localhost:${PORT}/api`);
    console.log(`🖼️  Uploads: http://localhost:${PORT}/uploads`);
  });
}

module.exports = app;
