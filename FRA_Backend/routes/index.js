// Backend Routes directory
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API routes operational' });
});

module.exports = router;
