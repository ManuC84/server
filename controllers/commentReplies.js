const CommentReply = require('../models/commentReply.js');
const Comment = require('../models/comment.js');
const User = require('../models/user.js');
const Notification = require('../models/notification.js');
const socketApi = require('../socketApi');

//FETCH COMMENT REPLIES
exports.fetchCommentReplies = async (req, res) => {
  const { postId: parentPostId, commentId: parentCommentId } = req.params;
  CommentReply.find(
    { parentCommentId: parentCommentId },
    function (error, commentReplies) {
      if (error) return res.status(400).json({ message: error.message });

      res.status(200).json(commentReplies);
    },
  );
};

//FETCH SINGLE COMMENT REPLY
exports.fetchSingleCommentReply = async (req, res) => {
  const { commentReplyId } = req.params;

  const commentReply = await CommentReply.findById(commentReplyId);
  try {
    res.status(200).json([commentReply]);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//POST COMMENT REPLIES && HANDLE SOCKET NOTIFICATIONS
exports.addCommentReply = async (req, res) => {
  const { commentReply, creator } = req.body;
  const { postId: parentPostId, commentId: parentCommentId } = req.params;

  console.log(creator);

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

  // Notifications

  const comment = await Comment.findById(parentCommentId);

  const commentReplyId = newCommentReply._id;

  const commentCreatorId = comment.creator[0]._id;

  // const commentCreator = await User.findById(commentCreatorId);

  if (commentCreatorId !== creator._id) {
    // commentCreator.notifications.unshift({
    //   commentReply,
    //   name: creator.name,
    //   userId: creator._id,
    //   createdAt: new Date().toISOString(),
    //   parentCommentId,
    //   parentPostId,
    //   read: false,
    //   commentReplyId,
    // });

    const newNotification = new Notification({
      commentReply,
      name: creator.name,
      userId: creator._id,
      createdAt: new Date().toISOString(),
      parentCommentId,
      parentPostId,
      parentUserId: commentCreatorId,
      read: false,
      commentReplyId,
    });
    await newNotification.save();
    socketApi.io.emit('user', newNotification);
  }

  // try {
  //   await User.findByIdAndUpdate(commentCreatorId, commentCreator, {
  //     new: true,
  //   });
  // } catch (error) {
  //   res.status(409).json({ message: error.message });
  // }
};

//LIKE COMMENT REPLIES
exports.likeCommentReply = async (req, res) => {
  const { userId } = req.body;
  const { postId, commentId, commentReplyId } = req.params;
  const commentReply = await CommentReply.findById(commentReplyId);

  const likeIndex = commentReply.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = commentReply.dislikes.findIndex(
    (id) => id === String(userId),
  );

  if (dislikeIndex !== -1) {
    commentReply.dislikes = commentReply.dislikes.filter(
      (id) => id !== String(userId),
    );
  }

  if (likeIndex === -1) {
    commentReply.likes.push(userId);
  } else {
    commentReply.likes = commentReply.likes.filter(
      (id) => id !== String(userId),
    );
  }

  try {
    await CommentReply.findByIdAndUpdate(commentReplyId, commentReply, {
      new: true,
    });
    res.status(201).json(commentReply);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

//DISLIKE COMMENT REPLIES
exports.dislikeCommentReply = async (req, res) => {
  const { userId } = req.body;
  const { postId, commentId, commentReplyId } = req.params;
  const commentReply = await CommentReply.findById(commentReplyId);

  const likeIndex = commentReply.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = commentReply.dislikes.findIndex(
    (id) => id === String(userId),
  );

  if (likeIndex !== -1) {
    commentReply.likes = commentReply.likes.filter(
      (id) => id !== String(userId),
    );
  }

  if (dislikeIndex === -1) {
    commentReply.dislikes.push(userId);
  } else {
    commentReply.dislikes = commentReply.dislikes.filter(
      (id) => id !== String(userId),
    );
  }

  try {
    await CommentReply.findByIdAndUpdate(commentReplyId, commentReply, {
      new: true,
    });
    res.status(201).json(commentReply);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

//EDIT COMMENT REPLY
exports.editCommentReply = async (req, res) => {
  const { postId, commentId, commentReplyId } = req.params;
  const { commentReplyText } = req.body;
  const commentReply = await CommentReply.findById(commentReplyId);
  if (
    req.userId !==
    (commentReply.creator[0].googleId || commentReply.creator[0]._id)
  ) {
    return res
      .status(401)
      .json({ error: 'You are not authorized to perform that action' });
  }
  commentReply.commentReply = commentReplyText;
  try {
    await CommentReply.findByIdAndUpdate(commentReplyId, commentReply, {
      new: true,
    });
    res.status(201).json(commentReply);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

//DELETE COMMENT REPLY
exports.deleteCommentReply = async (req, res) => {
  const { postId, commentId, commentReplyId } = req.params;
  await CommentReply.findById(
    commentReplyId,
    async function (err, commentReply) {
      if (!err) {
        await commentReply.remove();

        res.status(200).json(commentReply);
      }
    },
  );
};
