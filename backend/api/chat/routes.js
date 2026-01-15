const express = require('express');
const router = express.Router();
const { getMessages, getChatboxId, getUserChatboxes } = require('./controller');

// ✅ Fetch chat messages by chatbox ID
router.get('/messages/:chatboxId', getMessages);

// ✅ Generate consistent chatbox ID for a user pair
router.get('/chatbox/:senderId/:receiverId', getChatboxId);

// ✅ Get all chatboxes for a user
router.get('/chatboxes/:userId', getUserChatboxes);

// ✅ Mark messages as read manually via HTTP
// router.patch matches the HTTP verb choice for updates
const { markMessagesAsRead } = require('./controller');
router.patch('/read/:chatboxId/:userId', async (req, res) => {
    try {
        const { chatboxId, userId } = req.params;
        await markMessagesAsRead(chatboxId, userId);
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
});

module.exports = router;
