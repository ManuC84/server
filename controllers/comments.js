const Post = require("../models/postMessage.js");
const Comment = require("../models/comment.js");
const CommentReply = require("../models/commentReply.js");

//GET COMMENTS
exports.getComments = async (req, res) => {
  const { id: parentPostId } = req.params;
  try {
    const comments = await Comment.find({ parentPostId: parentPostId }).sort({
      createdAt: -1,
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

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
    await Post.findByIdAndUpdate(parentPostId, post, { new: true });
    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

//GET COMMENT REPLIES
exports.getCommentReplies = async (req, res) => {
  const { commentId: parentCommentId } = req.params;
  try {
    const commentReplies = await CommentReply.find({
      parentCommentId: parentCommentId,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json(commentReplies);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//POST COMMENT REPLIES
exports.addCommentReply = async (req, res) => {
  const { commentReply, creator } = req.body;
  const { postId: parentPostId, commentId: parentCommentId } = req.params;
  const newCommentReply = new CommentReply({
    commentReply,
    creator,
    parentPostId,
    parentCommentId,
  });

  const comment = await Comment.findById(parentCommentId);
  comment.commentReplies.unshift(newCommentReply);

  try {
    await Comment.findByIdAndUpdate(parentCommentId, comment, { new: true });
    await newCommentReply.save();
    res.status(201).json(newCommentReply);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
