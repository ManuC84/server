const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  creator: {
    type: [],
    default: [],
  },
  commentReplies: {
    type: [],
    default: [],
  },
  parentPostId: String,
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

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
