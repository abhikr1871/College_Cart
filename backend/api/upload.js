const express = require('express');
const { uploadImageToS3 } = require('../middleware/uploadImage');

const router = express.Router();

// POST /api/upload/profile
router.post('/profile', async (req, res) => {
  const { base64String, fileName, mimeType } = req.body;
  if (!base64String || !fileName || !mimeType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const result = await uploadImageToS3(base64String, fileName, mimeType);
    res.json({ url: result.Location });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 