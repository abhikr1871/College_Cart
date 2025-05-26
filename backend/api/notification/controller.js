const ChatNotification = require("./model");
const sendNotification = require("./utils/sendNotification");
const mongoose = require("mongoose");

/**
 * Helper to generate a consistent chatbox ID for notifications.
 * Ensures that the order of sender and receiver does not affect the chatboxId.
 */
function generateChatboxId(senderId, receiverId) {
  return [senderId, receiverId].sort().join("_");
}

/**
 * Create a notification endpoint.
 * Expects req.body to include: toUser, fromUser, senderId, receiverId, message, and optionally createdAt.
 */
exports.createNotification = async (req, res) => {
  try {
    const { toUser, fromUser, senderId, receiverId, message, createdAt } = req.body;
    const chatboxId = generateChatboxId(senderId, receiverId);

    // Save notification to MongoDB via the utility function.
    const notif = await sendNotification({ toUser, fromUser, message, chatboxId, createdAt });

    res.status(201).json(notif);
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ message: "Failed to save notification" });
  }
};

/**
 * Get unread notifications for a specific user.
 * Filters notifications embedded in each chatNotification document.
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await ChatNotification.find({ users: userId })
      .select("chatboxId notifications")
      .lean();

    // Filter notifications to include only unread ones for the user.
    const unread = notifications.flatMap(chat =>
      chat.notifications
        .filter(n => n.toUser === userId && !n.read)
        .map(n => ({
          ...n,
          chatboxId: chat.chatboxId
        }))
    );

    res.status(200).json(unread);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * Mark a specific notification as read.
 * Expects chatboxId and notifId as URL parameters.
 */
exports.markAsRead = async (req, res) => {
  try {
    const { chatboxId, notifId } = req.params;

    const updated = await ChatNotification.findOneAndUpdate(
      { chatboxId, "notifications.notifId": notifId },
      { $set: { "notifications.$.read": true } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", updated });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

/**
 * Delete a specific notification.
 * Expects chatboxId and notifId as URL parameters.
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { chatboxId, notifId } = req.params;

    const updated = await ChatNotification.findOneAndUpdate(
      { chatboxId },
      { $pull: { notifications: { notifId } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification or chat not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(`Error deleting notification:`, error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};
