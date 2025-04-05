const Chatbox = require('./model'); // Updated model

// Save a message to an existing chatbox or create a new chatbox
async function saveMessage({ senderId, receiverId, message }) {
  try {
    const chatboxId = [senderId, receiverId].sort().join('_'); // Ensure unique chatboxId

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
    
    // const newMessage = {
    //   message,
    //   senderId: String(senderId),
    //   receiverId: String(receiverId),
    //   timestamp: new Date(),
    // };
    
    // chatbox.messages.push(newMessage);
    // console.log('Saving message:', newMessage);

    
    await chatbox.save();

    return chatbox;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
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
    const chatboxId = [senderId, receiverId].sort().join('_');
    res.status(200).json({ chatboxId });
  } catch (error) {
    console.error("Error fetching chatboxId:", error);
    res.status(500).json({ message: "Failed to fetch chatboxId" });
  }
}

module.exports = { saveMessage, getMessages, getChatboxId };
