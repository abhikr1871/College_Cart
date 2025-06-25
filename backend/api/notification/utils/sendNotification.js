const ChatNotification = require("../model");
const mongoose = require("mongoose");

/**
 * Creates and stores a notification in the ChatNotification model.
 * @param {Object} params
 * @param {String} params.toUser - Recipient user ID.
 * @param {String} params.fromUser - Sender user ID.
 * @param {String} params.message - Notification message.
 * @param {String} params.chatboxId - Chatbox ID (should be generated consistently).
 * @param {Date} [params.createdAt=new Date()] - Optional creation timestamp.
 * @param {Boolean} [params.read=false] - Read status.
 * @returns {Promise<Object|null>} - The new notification.
 */
const sendNotification = async ({ toUser, fromUser, message, chatboxId, createdAt = new Date(), read = false }) => {
  try {
    const notifId = new mongoose.Types.ObjectId().toString();
    const newNotification = {
      notifId,
      toUser,
      fromUser,
      message,
      read,
      createdAt
    };

    const updated = await ChatNotification.findOneAndUpdate(
      { chatboxId },
      {
        $setOnInsert: { users: [toUser, fromUser] },
        $push: { notifications: newNotification }
      },
      { upsert: true, new: true }
    );

    return newNotification;
  } catch (err) {
    console.error("❌ Error sending notification:", err);
    return null;
  }
};

module.exports = sendNotification;
