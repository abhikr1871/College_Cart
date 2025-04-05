const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  senderName: { type: String,required: true},
});

// const messageSchema = new mongoose.Schema({
//   message: { type: String, required: true },
//   senderId: { type: String, required: true },
//   receiverId: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
// });

const chatboxSchema = new mongoose.Schema({
  chatboxId: { type: String, required: true, unique: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  messages: [messageSchema], // Array of messages between these two users
});

const Chatbox = mongoose.model('Chatbox', chatboxSchema);
module.exports = Chatbox;
