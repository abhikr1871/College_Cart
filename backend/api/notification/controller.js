const Notification = require("./model");

// ✅ Internal helper for socket use
async function saveNotification({ toUser, fromUser, type, message, chatboxId }) {
  const newNotif = new Notification({
    toUser,
    fromUser,
    type,
    message,
    chatboxId,
  });

  await newNotif.save();
  return newNotif;
}

exports.saveNotification = saveNotification;

exports.createNotification = async (req, res) => {
  try {
    const { toUser, fromUser, type, message, chatboxId } = req.body;
    const notif = await saveNotification({ toUser, fromUser, type, message, chatboxId });
    res.status(201).json(notif);
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ message: "Failed to save notification" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({ toUser: userId })
      .sort({ createdAt: -1 })
      .populate("fromUser", "name")
      .exec();

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};
