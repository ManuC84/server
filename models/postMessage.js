const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
  title: String,
  description: String,
  url: String,
  provider: String,
  icon: String,
  language: String,
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
});

var Post = mongoose.model("Post", postSchema);

module.exports = Post;
