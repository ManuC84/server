const Post = require("../models/postMessage.js");
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const CommentReply = require("../models/commentReply.js");
const socketApi = require("../socketApi");

//FETCH COMMENTS
exports.fetchComments = async (req, res) => {
  const { id: parentPostId } = req.params;

  Comment.find({ parentPostId: parentPostId }, function (err, comments) {
    if (err) return res.status(400).json({ message: error.message });

    res.status(200).json(comments);
  });
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

//FETCH COMMENT REPLIES
exports.fetchCommentReplies = async (req, res) => {
  const { postId: parentPostId, commentId: parentCommentId } = req.params;
  CommentReply.find(
    { parentCommentId: parentCommentId },
    function (err, commentReplies) {
      if (err) return res.status(400).json({ message: error.message });

      res.status(200).json(commentReplies);
    }
  );
};

//POST COMMENT REPLIES && HANDLE SOCKET NOTIFICATIONS
exports.addCommentReply = async (req, res) => {
  const { commentReply, creator } = req.body;
  const { postId: parentPostId, commentId: parentCommentId } = req.params;

  //Save comment reply to db
  const newCommentReply = new CommentReply({
    commentReply,
    creator,
    parentPostId,
    parentCommentId,
    createdAt: new Date().toISOString(),
  });

  newCommentReply.save(function (err, commentReply) {
    if (err) return res.status(409).json({ message: error.message });
    res.status(201).json(commentReply);
  });

  //Notifications
  // const post = await Post.findById(parentPostId);

  // const comment = post.comments.id(parentCommentId);

  // const commentReplyId =
  //   comment.commentReplies[comment.commentReplies.length - 1]._id;

  // const commentCreatorId = comment.creator[0]._id;

  // const commentCreator = await User.findById(commentCreatorId);

  // if (commentCreatorId !== creator._id) {
  //   commentCreator.notifications.unshift({
  //     commentReply,
  //     name: creator.name,
  //     userId: creator._id,
  //     createdAt: new Date().toISOString(),
  //     parentCommentId,
  //     parentPostId,
  //     read: false,
  //     commentReplyId,
  //   });
  //   socketApi.io.emit("user", JSON.stringify(commentCreator));
  // }

  // try {
  //   await User.findByIdAndUpdate(commentCreatorId, commentCreator, {
  //     new: true,
  //   });
  // } catch (error) {
  //   res.status(409).json({ message: error.message });
  // }
};

//LIKE COMMENTS
exports.likeComment = async (req, res) => {
  const { userId } = req.body;
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);

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
    await Comment.findByIdAndUpdate(commentId, comment, { new: true });
    res.status(201).json(comment);
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
  if (req.userId !== (comment.creator[0].googleId || comment.creator[0]._id)) {
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
    (commentReply.creator[0].googleId || commentReply.creator[0]._id)
  ) {
    return res
      .status(401)
      .json({ error: "You are not authorized to perform that action" });
  }
  post.comments.id(commentId).commentReplies.id(commentReplyId).commentReply =
    commentReplyText;
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

//FETCH NOTIFICATION
exports.fetchNotification = async (req, res) => {
  const { postId, commentId, commentReplyId, userId } = req.params;
  let post = await Post.findById(postId);
  post.comments = post.comments.id(commentId);
  post.comments[0].commentReplies = post.comments
    .id(commentId)
    .commentReplies.id(commentReplyId);

  await User.findById(userId, async function (err, user) {
    if (!err) {
      let updatedNotifications = user.notifications.map((notification) =>
        notification.commentReplyId == commentReplyId
          ? { ...notification, read: true }
          : notification
      );

      user.notifications = updatedNotifications;
      await user.save();
    }
  });

  try {
    res.status(200).send(post);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//CLEAR ALL NOTIFICATIONS
exports.clearAllNotifications = async (req, res) => {
  const { userId } = req.params;
  const { type } = req.body;
  await User.findById(userId, async function (err, user) {
    if (type == "clear") {
      if (!err) {
        user.notifications = [];
        await user.save();
      }
    }
    if (type == "read") {
      if (!err) {
        let updatedNotifications = user.notifications.map((notification) => {
          return { ...notification, read: true };
        });

        user.notifications = updatedNotifications;
        await user.save();
      }
    }
  });
};
