const Notification = require("../model");

/**
 * Creates and stores a notification in the database.
 * @param {Object} param0 
 * @param {String} param0.toUser - Recipient user ID
 * @param {String} param0.fromUser - Sender user ID
 * @param {String} param0.type - Notification type ('chat', 'like', 'comment')
 * @param {String} param0.message - Notification message
 * @param {String} [param0.chatboxId] - Optional chatbox ID
 * @returns {Promise<Notification|null>}
 */
const sendNotification = async ({ toUser, fromUser, type, message, chatboxId }) => {
  try {
    const notification = new Notification({
      toUser,
      fromUser,
      type,
      message,
      chatboxId,
    });

    const saved = await notification.save();
    return saved;
  } catch (err) {
    console.error("❌ Error sending notification:", err);
    return null;
  }
};

module.exports = sendNotification;
