const Chatbox = require('./model'); // Chatbox schema
const sendNotification = require('../notification/utils/sendNotification'); // helper to send notification

// Save a message to an existing chatbox or create a new one
const saveMessage = async ({ senderId, receiverId, message, senderName }) => {
  console.log('🛠️ saveMessage called with:', { senderId, receiverId, message, senderName });

  try {
    const chatboxId = [senderId, receiverId].sort().join('_');
    let chatbox = await Chatbox.findOne({ chatboxId });

    if (!chatbox) {
      chatbox = new Chatbox({
        chatboxId,
        senderId,
        receiverId,
        messages: []
      });
      console.log(`🆕 Created new chatbox: ${chatboxId}`);
    }

    const newMessage = {
      message,
      senderName,
      timestamp: new Date(),
      read: false
    };

    chatbox.messages.push(newMessage);

    await chatbox.save();
    console.log(`💬 Message saved to chatbox: ${chatboxId}`);
    console.log("📦 Final chatbox:", JSON.stringify(chatbox, null, 2));

    // Send notification
    await sendNotification({
      toUser: receiverId,
      fromUser: senderId,
      type: "chat",
      message: `New message from ${senderName}`,
      chatboxId
    });

    return chatbox;
  } catch (error) {
    console.error('❌ Error saving message:', error);
    throw error;
  }
};

// Fetch messages from a chatbox
const getMessages = async (req, res) => {
  const { chatboxId } = req.params;

  try {
    const chatbox = await Chatbox.findOne({ chatboxId });

    if (!chatbox) {
      return res.status(404).json({ message: "Chatbox not found" });
    }

    res.status(200).json({ messages: chatbox.messages });
  } catch (error) {
    console.error("🔥 Error fetching messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};

// Get or generate a chatboxId for two users
const getChatboxId = async (req, res) => {
  const { senderId, receiverId } = req.params;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "senderId and receiverId are required." });
  }

  try {
    const chatboxId = [senderId, receiverId].sort().join('_');
    res.status(200).json({ chatboxId });
  } catch (error) {
    console.error("❌ Error fetching chatboxId:", error);
    res.status(500).json({ message: "Failed to fetch chatboxId" });
  }
};

module.exports = {
  saveMessage,
  getMessages,
  getChatboxId
};
