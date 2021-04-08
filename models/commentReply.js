const mongoose = require("mongoose");

const commentReplySchema = mongoose.Schema({
  commentReply: {
    type: String,
  },
  creator: {
    type: [],
    default: [],
  },
  parentPostId: String,
  parentCommentId: String,
  likes: {
    type: [String],
    default: [],
  },
  dislikes: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

var CommentReply = mongoose.model("CommentReply", commentReplySchema);

module.exports = CommentReply;
