const { Router } = require('express');
const ringBuffer = require('../../../lib/@system/Logger/ring-buffer');

const router = Router();

router.get('/logs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? '100', 10), 500);
  res.json({ entries: ringBuffer.getRecent(limit) });
});

module.exports = router;
