const express = require('express');
const router = express.Router();

// Define a simple route
router.get('/example', (req, res) => {
  res.json({ message: 'This is an example API route' });
});

module.exports = router;
