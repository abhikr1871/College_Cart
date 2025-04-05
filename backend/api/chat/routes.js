const express = require('express');
const router = express.Router();
const { saveMessage, getMessages, getChatboxId } = require('./controller');

router.post('/message', async (req, res) => {
  try {
    const chatbox = await saveMessage(req.body);
    res.status(201).json({ message: "Message saved successfully.", chatbox });
  } catch (error) {
    res.status(500).json({ message: "Failed to save message" });
  }
});

router.get('/messages/:chatboxId', getMessages); // Retrieve chat history
router.get('/chatbox/:senderId/:receiverId', getChatboxId); // Get chatbox ID

module.exports = router;
