const { findByIdAndDelete } = require("../models/postMessage.js");
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
  post.comments.id(parentCommentId).commentReplies.push({
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

//DISLIKE COMMENTS
exports.dislikeComment = async (req, res) => {
  const { userId } = req.body;
  const { postId, commentId } = req.params;

  const post = await Post.findById(postId);
  const comment = post.comments.id(commentId);

  const likeIndex = comment.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = comment.dislikes.findIndex(
    (id) => id === String(userId)
  );

  if (likeIndex !== -1) {
    comment.likes = comment.likes.filter((id) => id !== String(userId));
  }

  if (dislikeIndex === -1) {
    comment.dislikes.push(userId);
  } else {
    comment.dislikes = comment.dislikes.filter((id) => id !== String(userId));
  }

  try {
    await Post.findByIdAndUpdate(postId, post, { new: true });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

//LIKE COMMENT REPLIES
exports.likeCommentReply = async (req, res) => {
  const { userId } = req.body;
  const { postId, commentId, commentReplyId } = req.params;
  const post = await Post.findById(postId);
  const comment = post.comments.id(commentId);
  const commentReply = comment.commentReplies.id(commentReplyId);

  const likeIndex = commentReply.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = commentReply.dislikes.findIndex(
    (id) => id === String(userId)
  );

  if (dislikeIndex !== -1) {
    commentReply.dislikes = commentReply.dislikes.filter(
      (id) => id !== String(userId)
    );
  }

  if (likeIndex === -1) {
    commentReply.likes.push(userId);
  } else {
    commentReply.likes = commentReply.likes.filter(
      (id) => id !== String(userId)
    );
  }

  try {
    await Post.findByIdAndUpdate(postId, post, { new: true });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

//DISLIKE COMMENT REPLIES
exports.dislikeCommentReply = async (req, res) => {
  const { userId } = req.body;
  const { postId, commentId, commentReplyId } = req.params;
  const post = await Post.findById(postId);
  const comment = post.comments.id(commentId);
  const commentReply = comment.commentReplies.id(commentReplyId);

  const likeIndex = commentReply.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = commentReply.dislikes.findIndex(
    (id) => id === String(userId)
  );

  if (likeIndex !== -1) {
    commentReply.likes = commentReply.likes.filter(
      (id) => id !== String(userId)
    );
  }

  if (dislikeIndex === -1) {
    commentReply.dislikes.push(userId);
  } else {
    commentReply.dislikes = commentReply.dislikes.filter(
      (id) => id !== String(userId)
    );
  }

  try {
    await Post.findByIdAndUpdate(postId, post, { new: true });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

//EDIT COMMENT
exports.editComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { commentText } = req.body;
  const post = await Post.findById(postId);
  let comment = post.comments.id(commentId);
  if (
    req.userId !==
    (comment.creator[0].data.result.googleId ||
      comment.creator[0].data.result._id)
  ) {
    return res
      .status(401)
      .json({ error: "You are not authorized to perform that action" });
  }
  post.comments.id(commentId).comment = commentText;
  try {
    await Post.findByIdAndUpdate(postId, post, { new: true });
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//EDIT COMMENT REPLY
exports.editCommentReply = async (req, res) => {
  const { postId, commentId, commentReplyId } = req.params;
  const { commentReplyText } = req.body;
  const post = await Post.findById(postId);
  let comment = post.comments.id(commentId);
  const commentReply = comment.commentReplies.id(commentReplyId);
  if (
    req.userId !==
    (commentReply.creator[0].data.result.googleId ||
      commentReply.creator[0].data.result._id)
  ) {
    return res
      .status(401)
      .json({ error: "You are not authorized to perform that action" });
  }
  post.comments
    .id(commentId)
    .commentReplies.id(commentReplyId).commentReply = commentReplyText;
  try {
    await Post.findByIdAndUpdate(postId, post, { new: true });
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//DELETE COMMENT
exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  await Post.findById(postId, async function (err, post) {
    if (!err) {
      await post.comments.id(commentId).remove();
      await post.save();
      res.status(200).json(post);
    }
  });
};
//DELETE COMMENT
exports.deleteCommentReply = async (req, res) => {
  const { postId, commentId, commentReplyId } = req.params;
  await Post.findById(postId, async function (err, post) {
    if (!err) {
      let comment = post.comments.id(commentId);
      let commentReply = comment.commentReplies.id(commentReplyId);
      await commentReply.remove();
      await post.save();
      res.status(200).json(post);
    }
  });
};
