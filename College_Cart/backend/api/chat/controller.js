const Message = require('./model');
const User = require('../users/model');

// Get messages for a chatbox
exports.getMessages = async (req, res) => {
  try {
    const { chatboxId } = req.params;
    const messages = await Message.find({ chatboxId })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Get chat contacts for a user
exports.getChatContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ timestamp: -1 });

    // Extract unique contacts and their last messages
    const contactsMap = new Map();

    for (const message of messages) {
      const contactId = message.senderId === userId ? message.receiverId : message.senderId;
      const contactName = message.senderId === userId ? message.receiverName : message.senderName;
      
      if (!contactsMap.has(contactId)) {
        // Get unread count for this contact
        const unreadCount = await Message.countDocuments({
          chatboxId: message.chatboxId,
          receiverId: userId,
          isRead: false
        });

        contactsMap.set(contactId, {
          userId: contactId,
          userName: contactName,
          chatboxId: message.chatboxId,
          lastMessage: message.message,
          lastMessageTime: message.timestamp,
          unreadCount
        });
      }
    }

    // Convert map to array and sort by last message time
    const contacts = Array.from(contactsMap.values())
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching chat contacts:', error);
    res.status(500).json({ error: 'Failed to fetch chat contacts' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, senderName, receiverName, message } = req.body;
    const chatboxId = [senderId, receiverId].sort().join('_');

    const newMessage = new Message({
      chatboxId,
      senderId,
      receiverId,
      senderName,
      receiverName,
      message,
      timestamp: new Date(),
      isRead: false
    });

    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { chatboxId, userId } = req.body;
    
    await Message.updateMany(
      { 
        chatboxId,
        receiverId: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
}; 