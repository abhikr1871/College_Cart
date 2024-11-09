// chatRoutes.js
const express = require('express');
const Message = require('./model'); // Adjust path if necessary
const router = express.Router();
const authMiddleware = require('../../middleware/auth.js'); 
const {saveMessageToDatabase, getChatHistory }=require('./controller');
// Route to send/save a message

router.get('/chat/:userId1/:userId2',getChatHistory );


router.post('/send', async (req, res) => {
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
