const Post = require('../models/postMessage.js');
const User = require('../models/user.js');
const Comment = require('../models/comment.js');
const CommentReply = require('../models/commentReply.js');
const Notification = require('../models/notification.js');

//FETCH NOTIFICATION TEST
exports.fetchNotificationsTest = async (req, res) => {
  const { userId } = req.params;

  const userNotifications = await Notification.find({ parentUserId: userId });

  try {
    res.status(200).json(userNotifications);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//READ SINGLE NOTIFICATION
exports.readNotification = async (req, res) => {
  const { notificationId } = req.params;
  const notification = await Notification.findById(notificationId);
  notification.read = true;
  try {
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//READ ALL NOTIFICATIONS
exports.readAllNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const readNotifications = await Notification.updateMany({}, { read: true });
    res.status(200).send(readNotifications);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//CLEAR ALL NOTIFICATIONS
exports.clearAllNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    await Notification.deleteMany({
      parentUserId: userId,
    });
    res.status(200).send();
  } catch (error) {
    res.status(404).json({ error: error });
  }
};
