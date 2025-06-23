const express = require('express');
const router = express.Router();
const chatController = require('./controller');
const auth = require('../../middleware/auth');

// Get messages for a chatbox
router.get('/messages/:chatboxId', auth, chatController.getMessages);

// Get chat contacts for a user
router.get('/contacts/:userId', auth, chatController.getChatContacts);

// Send a message
router.post('/send', auth, chatController.sendMessage);

// Mark messages as read
router.post('/markAsRead', auth, chatController.markAsRead);

module.exports = router; 