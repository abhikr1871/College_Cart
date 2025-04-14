const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
} = require("./controller");


router.get("/user/:userId", getNotifications);

router.patch("/read/:id", markAsRead);

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
 
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(`Error deleting notification with ID ${id}:`, error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

module.exports = router;
