const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
} = require("./controller");

// 📥 Get all notifications for a specific user
router.get("/user/:userId", getNotifications);

// ✅ Mark a single notification as read
router.patch("/read/:id", markAsRead);

module.exports = router;
