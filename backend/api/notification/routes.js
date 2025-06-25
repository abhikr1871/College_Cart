const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  createNotification
} = require("./controller");

router.get("/user/:userId", getNotifications);

router.post("/create", createNotification);

router.patch("/read/:chatboxId/:notifId", markAsRead);
router.delete("/:chatboxId/:notifId", deleteNotification);

module.exports = router;
