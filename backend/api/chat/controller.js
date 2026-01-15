const Chatbox = require('./model'); // Chatbox schema
const sendNotification = require('../notification/utils/sendNotification');
const { getUserById } = require('../users/controller');

const saveMessage = async ({ senderId, receiverId, message, senderName, receiverName }) => {
  console.log('🛠️ saveMessage called with:', { senderId, receiverId, message, senderName, receiverName });

  try {
    // Convert IDs to numbers
    const senderIdNum = Number(senderId);
    const receiverIdNum = Number(receiverId);

    const chatboxId = [senderIdNum, receiverIdNum].sort().join('_');
    let chatbox = await Chatbox.findOne({ chatboxId });

    if (!chatbox) {
      chatbox = new Chatbox({
        chatboxId,
        senderId: senderIdNum,
        receiverId: receiverIdNum,
        messages: []
      });
      console.log(`🆕 Created new chatbox: ${chatboxId}`);
    }

    const newMessage = {
      senderId: senderIdNum, // Added senderId
      message,
      senderName,
      receiverName,
      timestamp: new Date(),
      read: false,
      status: 'sent' // Default to sent
    };

    chatbox.messages.push(newMessage);
    chatbox.lastMessageAt = new Date(); // Update sort timestamp
    await chatbox.save();

    console.log(`💬 Message saved to chatbox: ${chatboxId}`);

    // Send notification
    await sendNotification({
      toUser: receiverIdNum,
      fromUser: senderIdNum,
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
    // Convert IDs to numbers
    const senderIdNum = Number(senderId);
    const receiverIdNum = Number(receiverId);

    const chatboxId = [senderIdNum, receiverIdNum].sort().join('_');
    res.status(200).json({ chatboxId });
  } catch (error) {
    console.error("❌ Error fetching chatboxId:", error);
    res.status(500).json({ message: "Failed to fetch chatboxId" });
  }
};

// Mark messages as read
const markMessagesAsRead = async (chatboxId, userId) => {
  try {
    const chatbox = await Chatbox.findOne({ chatboxId });
    if (!chatbox) return;

    let updated = false;
    chatbox.messages.forEach(msg => {
      // Mark messages as read if I am the receiver (senderId is not me) and they are not read
      if (msg.senderId && msg.senderId !== Number(userId) && !msg.read) {
        msg.read = true;
        msg.status = 'read'; // Sync status
        updated = true;
      }
    });

    if (updated) {
      await chatbox.save();
      console.log(`✅ Marked messages as read in ${chatboxId}`);
    }
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
  }
};

const updateMessageStatus = async (chatboxId, messageId, status) => {
  try {
    await Chatbox.findOneAndUpdate(
      { chatboxId, "messages._id": messageId },
      { $set: { "messages.$.status": status } }
    );
    // console.log(`✅ Updated message ${messageId} status to ${status}`);
  } catch (error) {
    console.error('❌ Error updating message status:', error);
  }
};

const getUserChatboxes = async (req, res) => {
  const { userId } = req.params;
  const userIdNum = Number(userId);

  try {
    const chatboxes = await Chatbox.find({
      $or: [
        { senderId: userIdNum },
        { receiverId: userIdNum }
      ]
    }).sort({ lastMessageAt: -1 }); // Optimized sort

    const processedChatboxes = await Promise.all(chatboxes.map(async (chatbox) => {
      const lastMessage = chatbox.messages[chatbox.messages.length - 1];

      const unreadCount = chatbox.messages.filter(msg => {
        // Only count if senderId exists and it's not me.
        return msg.senderId && msg.senderId !== userIdNum && !msg.read;
      }).length;

      const [user1Id, user2Id] = chatbox.chatboxId.split('_').map(Number);
      const otherUserId = userIdNum === user1Id ? user2Id : user1Id;

      const otherUser = await getUserById(otherUserId);

      return {
        chatboxId: chatbox.chatboxId,
        otherUserId,
        otherUserName: otherUser,
        lastMessage: lastMessage?.message || '',
        lastMessageTime: lastMessage?.timestamp || chatbox.lastMessageAt || chatbox.updatedAt,
        unreadCount
      };
    }));

    res.status(200).json(processedChatboxes);
  } catch (error) {
    console.error('Error in getUserChatboxes:', error);
    res.status(500).json({ message: 'Failed to fetch chatboxes' });
  }
};

module.exports = {
  saveMessage,
  getMessages,
  getChatboxId,
  getUserChatboxes,
  getUserChatboxes,
  markMessagesAsRead,
  updateMessageStatus
};
