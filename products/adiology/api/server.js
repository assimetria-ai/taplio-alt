// Adiology API Server
// Professional radio streaming and podcast platform

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'adiology-api',
    timestamp: new Date().toISOString()
  });
});

// API Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Adiology API',
    version: '1.0.0',
    description: 'Professional radio streaming and podcast platform for creators and broadcasters'
  });
});

// Placeholder endpoints for future implementation
app.get('/api/streams', (req, res) => {
  res.json({ 
    message: 'Streams endpoint - to be implemented',
    streams: []
  });
});

app.get('/api/podcasts', (req, res) => {
  res.json({ 
    message: 'Podcasts endpoint - to be implemented',
    podcasts: []
  });
});

app.get('/api/analytics', (req, res) => {
  res.json({ 
    message: 'Analytics endpoint - to be implemented',
    data: {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎙️  Adiology API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
