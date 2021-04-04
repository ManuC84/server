const Post = require("../models/postMessage.js");
const Comment = require("../models/comment.js");

//POST COMMENTS
exports.addComments = async (req, res) => {
  const { comment, creator } = req.body;
  const { id: parentPostId } = req.params;
  const newComment = new Comment({
    comment,
    creator,
    parentPostId,
  });

  const post = await Post.findById(parentPostId);
  post.comments.unshift(newComment);

  try {
    await newComment.save();
    const updatedPost = await Post.findByIdAndUpdate(parentPostId, post, {
      new: true,
    });
    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
