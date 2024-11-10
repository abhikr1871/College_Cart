// controllers/messageController.js
const Message = require('./model'); // Update path as needed

// Controller for saving a message to the database
async function saveMessage(req, res) {
  const { senderId, receiverId, message } = req.body;

  // Validate required fields
  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ message: "Sender ID, receiver ID, and message are required." });
  }

  try {
    // Create a new message document and save it
    const newMessage = new Message({ senderId, receiverId, message, timestamp: Date.now() });
    await newMessage.save();
    res.status(201).json(newMessage); // Return the saved message as JSON
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Failed to save message' });
  }
}

// Controller for fetching chat history between two users
async function getChatHistory(req, res) {
  const { userId1, userId2 } = req.params;

  // Validate required parameters
  if (!userId1 || !userId2) {
    return res.status(400).json({ message: "Both user IDs are required." });
  }

  try {
    const chatHistory = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ timestamp: 1 }); // Sort messages by timestamp for ordered history

    res.status(200).json(chatHistory); // Send chat history as JSON
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
}

module.exports = { saveMessage, getChatHistory };
