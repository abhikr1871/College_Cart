// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  toUser: { type: String, required: true },
  fromUser: { type: String, required: true },
  type: { type: String, enum: ['chat', 'like', 'comment'], required: true },
  message: { type: String, required: true },
  chatboxId: { type: String }, // optional if type is "chat"
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
