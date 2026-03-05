/**
 * Adiology — Express App
 * 
 * Entry point for the Adiology product
 * Bootstrap placeholder - to be implemented based on product specs
 */

const express = require('express');
const app = express();
const config = require('./config');

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', product: 'adiology' });
});

// Routes will be added here

module.exports = app;

// Start server if run directly
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Adiology running on port ${config.port}`);
  });
}
