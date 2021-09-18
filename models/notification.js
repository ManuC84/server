const mongoose = require('mongoose');

const notificationsSchema = mongoose.Schema({
  commentReply: { type: String },
  name: { type: String },
  userId: { type: String },
  createdAt: { type: Date, default: new Date() },
  parentCommentId: { type: String },
  parentPostId: { type: String },
  parentUserId: { type: String },
  read: false,
  commentReplyId: { type: String },
  imageUrl: { type: String },
});

var Notification = mongoose.model('Notification', notificationsSchema);

module.exports = Notification;
