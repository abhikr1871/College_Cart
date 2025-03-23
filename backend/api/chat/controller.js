const Chatbox = require('./model'); // Updated model

// Save a message to an existing chatbox or create a new chatbox
async function saveMessage(req, res) {
  let { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ message: "senderId, receiverId, and message are required." });
  }

  try {
    // Generate a unique chatboxId (sorted to ensure consistency)
    const chatboxId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;

    // Find the existing chatbox or create a new one
    let chatbox = await Chatbox.findOne({ chatboxId });

    if (!chatbox) {
      chatbox = new Chatbox({ chatboxId, senderId, receiverId, messages: [] });
    }

    // Push the new message into the messages array
    chatbox.messages.push({ message, timestamp: Date.now() });

    // Save the updated chatbox
    await chatbox.save();

    res.status(201).json({ message: "Message saved successfully.", chatbox });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Failed to save message" });
  }
}

// Fetch all messages for a chatbox
async function getMessages(req, res) {
  const { chatboxId } = req.params;

  try {
    const chatbox = await Chatbox.findOne({ chatboxId });

    if (!chatbox) {
      return res.status(404).json({ message: "No messages found for this chatbox." });
    }

    res.status(200).json(chatbox.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
}

// Get or create a chatboxId between two users
async function getChatboxId(req, res) {
  const { senderId, receiverId } = req.params;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "senderId and receiverId are required." });
  }

  try {
    const chatboxId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
    res.status(200).json({ chatboxId });
  } catch (error) {
    console.error("Error fetching chatboxId:", error);
    res.status(500).json({ message: "Failed to fetch chatboxId" });
  }
}

// Function to save messages from WebSocket


async function saveMessageToDatabase({ senderId, receiverId, message }) {
  try {
    const chatboxId = [senderId, receiverId].sort().join('_'); // Ensure unique chatboxId for both users

    let chatbox = await Chatbox.findOne({ chatboxId });

    if (!chatbox) {
      chatbox = new Chatbox({
        chatboxId,
        senderId,
        receiverId,
        messages: [],
      });
    }

    const newMessage = { message, timestamp: new Date() };
    chatbox.messages.push(newMessage); // Add the new message

    await chatbox.save();

    return chatbox;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}




module.exports = { saveMessage, getMessages, getChatboxId, saveMessageToDatabase };
