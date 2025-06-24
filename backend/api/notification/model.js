const mongoose = require('mongoose');

// Single notification schema (embedded in array)
const singleNotificationSchema = new mongoose.Schema({
  notifId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  toUser: { type: Number, ref: 'User', required: true },
  fromUser: { type: Number, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Main schema for each chatbox (for notifications)
const chatNotificationSchema = new mongoose.Schema({
  chatboxId: { type: String, required: true, unique: true }, // e.g. 'user1_user2'
  users: [{ type: Number, ref: 'User' }], // optionally track both users
  notifications: [singleNotificationSchema]
});

// Index for efficient lookup
chatNotificationSchema.index({ chatboxId: 1 });

module.exports = mongoose.model('ChatNotification', chatNotificationSchema);
