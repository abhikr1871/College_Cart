const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  senderName: { type: String, required: true },
  read: { type: Boolean, default: false }
});

const chatboxSchema = new mongoose.Schema({
  chatboxId: { type: String, required: true, unique: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  messages: [messageSchema],
});

const Chatbox = mongoose.model('Chatbox', chatboxSchema);
module.exports = Chatbox;
