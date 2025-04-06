const express = require('express');
const router = express.Router();
const { getMessages, getChatboxId } = require('./controller');

// ✅ Fetch chat messages by chatbox ID
router.get('/messages/:chatboxId', getMessages);

// ✅ Generate consistent chatbox ID for a user pair
router.get('/chatbox/:senderId/:receiverId', getChatboxId);

module.exports = router;
