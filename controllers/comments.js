const Post = require("../models/postMessage.js");
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const CommentReply = require("../models/commentReply.js");
const Notification = require("../models/notification.js");

//FETCH COMMENTS
exports.fetchComments = async (req, res) => {
  const { id: parentPostId } = req.params;

  Comment.find({ parentPostId: parentPostId }, function (error, comments) {
    if (error) return res.status(400).json({ message: error.message });

    res.status(200).json(comments);
  });
};

//FETCH SINGLE COMMENT
exports.fetchSingleComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    res.status(200).json([comment]);
  } catch (error) {
    res.status(404).json({ error: error });
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
    createdAt: new Date().toISOString(),
  });

  newComment.save(function (err, comment) {
    if (err) return res.status(409).json({ message: error.message });
    res.status(201).json(comment);
  });
};

//LIKE COMMENTS
exports.likeComment = async (req, res) => {
  const { userId } = req.body;
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);

  const likeIndex = comment.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = comment.dislikes.findIndex((id) => id === String(userId));

  if (dislikeIndex !== -1) {
    comment.dislikes = comment.dislikes.filter((id) => id !== String(userId));
  }

  if (likeIndex === -1) {
    comment.likes.push(userId);
  } else {
    comment.likes = comment.likes.filter((id) => id !== String(userId));
  }

  try {
    await Comment.findByIdAndUpdate(commentId, comment, { new: true });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

//DISLIKE COMMENTS
exports.dislikeComment = async (req, res) => {
  const { userId } = req.body;
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  const likeIndex = comment.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = comment.dislikes.findIndex((id) => id === String(userId));

  if (likeIndex !== -1) {
    comment.likes = comment.likes.filter((id) => id !== String(userId));
  }

  if (dislikeIndex === -1) {
    comment.dislikes.push(userId);
  } else {
    comment.dislikes = comment.dislikes.filter((id) => id !== String(userId));
  }

  try {
    await Comment.findByIdAndUpdate(commentId, comment, { new: true });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

//EDIT COMMENT
exports.editComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { commentText } = req.body;
  const comment = await Comment.findById(commentId);

  if (req.userId !== (comment.creator[0].googleId || comment.creator[0]._id)) {
    return res.status(401).json({ error: "You are not authorized to perform that action" });
  }
  comment.comment = commentText;
  try {
    await Comment.findByIdAndUpdate(commentId, comment, { new: true });
    res.status(200).json(comment);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//DELETE COMMENT
exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  //delete notification with parent comment id
  await Notification.deleteMany({ parentCommentId: commentId });

  //delete comment replies
  await CommentReply.deleteMany({ parentCommentId: commentId });

  await Comment.findById(commentId, async function (err, comment) {
    if (!err) {
      await comment.remove();

      res.status(200).json(comment);
    }
  });
};

//FETCH TOP COMMENTS
exports.fetchTopComments = async (req, res) => {
  try {
    const topComments = await Comment.aggregate([
      {
        $addFields: {
          likesLength: {
            $size: "$likes",
          },
        },
      },
      { $match: { likesLength: { $gt: 0 } } },
      {
        $sort: {
          likesLength: -1,
        },
      },

      {
        $limit: 3,
      },
    ]);
    console.log("topComments:", topComments);
    res.status(200).json(topComments);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};
