const express = require("express");
const router = express.Router();
const Notification = require("../model/NotificationSchema");

router.post("/markread", async (req, res) => {
  const { username, role } = req.body;

  try {
    await Notification.updateMany(
      { receiverUsername: username, receiverRole: role, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error marking as read", error: err });
  }
});

module.exports = router;