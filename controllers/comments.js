const Post = require("../models/postMessage.js");

//POST COMMENTS
exports.addComments = async (req, res) => {
  const { comment, creator } = req.body;
  const { id: parentPostId } = req.params;

  const post = await Post.findById(parentPostId);
  post.comments.unshift({
    comment,
    creator,
    parentPostId,
    createdAt: new Date().toISOString(),
  });

  try {
    await Post.findByIdAndUpdate(parentPostId, post, { new: true });

    res.status(201).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

//POST COMMENT REPLIES
exports.addCommentReply = async (req, res) => {
  const { commentReply, creator } = req.body;
  const { postId: parentPostId, commentId: parentCommentId } = req.params;

  const post = await Post.findById(parentPostId);
  post.comments.id(parentCommentId).commentReplies.unshift({
    commentReply,
    creator,
    parentPostId,
    parentCommentId,
    createdAt: new Date().toISOString(),
  });

  try {
    await Post.findByIdAndUpdate(parentPostId, post, { new: true });
    res.status(201).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

//LIKE COMMENTS
exports.likeComment = async (req, res) => {
  const { userId } = req.body;
  const { postId, commentId } = req.params;

  const post = await Post.findById(postId);
  const comment = post.comments.id(commentId);

  const likeIndex = comment.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = comment.dislikes.findIndex(
    (id) => id === String(userId)
  );

  if (dislikeIndex !== -1) {
    comment.dislikes = comment.dislikes.filter((id) => id !== String(userId));
  }

  if (likeIndex === -1) {
    comment.likes.push(userId);
  } else {
    comment.likes = comment.likes.filter((id) => id !== String(userId));
  }

  try {
    await Post.findByIdAndUpdate(postId, post, { new: true });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
