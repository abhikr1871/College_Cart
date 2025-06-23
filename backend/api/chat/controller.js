const Chatbox = require('./model'); // Chatbox schema
const sendNotification = require('../notification/utils/sendNotification');

const saveMessage = async ({ senderId, receiverId, message, senderName, receiverName }) => {
  console.log('🛠️ saveMessage called with:', { senderId, receiverId, message, senderName, receiverName });

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
      receiverName,
      timestamp: new Date(),
      read: false
    };

    chatbox.messages.push(newMessage);
    await chatbox.save();

    console.log(`💬 Message saved to chatbox: ${chatboxId}`);

    // Send notification
    await sendNotification({
      toUser: receiverId,
      fromUser: senderId,
      message: `New message from ${senderName}`,
      chatboxId
    });

    return chatbox;
  } catch (error) {
    console.error('❌ Error saving message:', error);
    throw error;
  }
};

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

// Get all chatboxes for a user
const getUserChatboxes = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all chatboxes where the user is either sender or receiver
    const chatboxes = await Chatbox.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ 'messages.timestamp': -1 }); // Sort by most recent message

    // Process chatboxes to get last messages and unread counts
    const processedChatboxes = chatboxes.map(chatbox => {
      const lastMessage = chatbox.messages[chatbox.messages.length - 1];
      const unreadCount = chatbox.messages.filter(
        msg => !msg.read && (userId === chatbox.receiverId)
      ).length;

      const otherUserId = chatbox.senderId === userId ? chatbox.receiverId : chatbox.senderId;
      const otherUserName = lastMessage 
        ? (chatbox.senderId === userId ? lastMessage.receiverName : lastMessage.senderName)
        : 'Unknown User';

      return {
        chatboxId: chatbox.chatboxId,
        otherUserId,
        otherUserName,
        lastMessage: lastMessage?.message || '',
        lastMessageTime: lastMessage?.timestamp || chatbox.updatedAt,
        unreadCount
      };
    });

    res.status(200).json(processedChatboxes);
  } catch (error) {
    console.error("❌ Error fetching user chatboxes:", error);
    res.status(500).json({ message: "Failed to fetch chatboxes" });
  }
};

module.exports = {
  saveMessage,
  getMessages,
  getChatboxId,
  getUserChatboxes
};
