const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: String,
  description: String,
  url: String,
  image: String,
  keywords: {
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
