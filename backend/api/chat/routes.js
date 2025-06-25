const express = require('express');
const router = express.Router();
const { getMessages, getChatboxId, getUserChatboxes } = require('./controller');

// ✅ Fetch chat messages by chatbox ID
router.get('/messages/:chatboxId', getMessages);

// ✅ Generate consistent chatbox ID for a user pair
router.get('/chatbox/:senderId/:receiverId', getChatboxId);

// ✅ Get all chatboxes for a user
router.get('/chatboxes/:userId', getUserChatboxes);

module.exports = router;
