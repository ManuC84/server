const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  comment: {
    type: String,
  },
  creator: {
    type: [],
    default: [],
  },
  parentPostId: { type: String },
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
  commentReplies: {
    type: [],
    default: [],
  },
});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
