const express = require('express');
const router = express.Router();
const { saveMessage, getMessages, getChatboxId } = require('./controller');

router.post('/message', saveMessage); // Store messages in a chatbox
router.get('/messages/:chatboxId', getMessages); // Retrieve chat history
router.get('/chatbox/:senderId/:receiverId', getChatboxId); // Get chatbox ID

module.exports = router;
