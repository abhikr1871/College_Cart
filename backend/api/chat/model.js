const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: Number, required: true }, // Added for read status logic
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  senderName: { type: String, required: true },
  receiverName: { type: String, required: true },
  read: { type: Boolean, default: false },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' } // Added status field
});

const chatboxSchema = new mongoose.Schema({
  chatboxId: { type: String, required: true, unique: true },
  senderId: { type: Number, required: true },
  receiverId: { type: Number, required: true },
  messages: [messageSchema],
  lastMessageAt: { type: Date, default: Date.now } // efficient sorting
});

chatboxSchema.index({ lastMessageAt: -1 });

const Chatbox = mongoose.model('Chatbox', chatboxSchema);
module.exports = Chatbox;
