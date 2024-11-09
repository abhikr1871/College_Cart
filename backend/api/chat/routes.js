// chatRoutes.js
const express = require('express');
const Message = require('./model'); // Adjust path if necessary
const router = express.Router();
const { saveMessageToDatabase, getChatHistory } = require('./controller');

// Get chat history between two users
router.get('/chat/:userId1/:userId2', getChatHistory);

// Send message endpoint
router.post('/', async (req, res) => {  // Change route to '/'
  const { senderId, receiverId, message } = req.body;

  try {
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create a new message document
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
    });

    // Save message to the database
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
