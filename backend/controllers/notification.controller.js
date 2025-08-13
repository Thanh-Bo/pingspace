import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId })
      .populate({
        path: "from",
        select: "fullName profilePic",
      })
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      to: userId,
      read: false,
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json({
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.log("Error in getNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotificationsById = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    // Check if the notification belongs to the user
    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this notification" });
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotificationsById function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
