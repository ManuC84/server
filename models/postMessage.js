const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentReplies = new Schema({
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

const Comments = new Schema({
  comment: {
    type: String,
  },
  creator: {
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
  commentReplies: [CommentReplies],
});

const postSchema = mongoose.Schema({
  title: String,
  description: String,
  url: String,
  provider: String,
  icon: String,
  creator: {
    type: [],
    default: [],
  },
  image: String,
  tags: {
    type: [String],
    default: [],
  },
  type: String,
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
  comments: [Comments],
});

var Post = mongoose.model("Post", postSchema);

module.exports = Post;
