const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  getPosts,
  createPost,
  getPostsByTags,
  addTags,
  getSinglePost,
  likePost,
  dislikePost,
} = require("../controllers/posts.js");
const {
  fetchComments,
  addComments,
  fetchCommentReplies,
  addCommentReply,
  likeComment,
  dislikeComment,
  likeCommentReply,
  dislikeCommentReply,
  editComment,
  editCommentReply,
  deleteComment,
  deleteCommentReply,
  fetchNotification,
  clearAllNotifications,
} = require("../controllers/comments.js");
const { auth } = require("../middleware/auth.js");

router.get("/", getPosts);

router.post("/", body("url").isURL().withMessage("Invalid Url"), createPost);

router.get("/:id", getSinglePost);

router.get("/:id/comments", fetchComments);

router.post("/:id/comments", auth, addComments);

router.get("/:postId/comments/:commentId/commentReplies", fetchCommentReplies);

router.post("/:postId/comments/:commentId", auth, addCommentReply);

router.post("/tags", body("tags.*").trim().escape(), getPostsByTags);

router.post("/tags/addTags/:id", body("tag").trim().escape(), addTags);

router.post("/:postId/likes", auth, likePost);

router.post("/:postId/dislikes", auth, dislikePost);

router.post("/:postId/comments/:commentId/likes", auth, likeComment);

router.post("/:postId/comments/:commentId/dislikes", auth, dislikeComment);

router.post(
  "/:postId/comments/:commentId/commentReplies/:commentReplyId/likes",
  auth,
  likeCommentReply
);

router.post(
  "/:postId/comments/:commentId/commentReplies/:commentReplyId/dislikes",
  auth,
  dislikeCommentReply
);

router.put("/:postId/comments/:commentId/edit", auth, editComment);

router.put(
  "/:postId/comments/:commentId/commentReplies/:commentReplyId/edit",
  auth,
  editCommentReply
);

router.delete("/:postId/comments/:commentId/delete", auth, deleteComment);

router.delete(
  "/:postId/comments/:commentId/commentReplies/:commentReplyId/delete",
  auth,
  deleteCommentReply
);

router.post(
  "/:postId/comments/:commentId/commentReplies/:commentReplyId/user/:userId/notifications",
  auth,
  fetchNotification
);

router.post("/:userId/clearAllNotifications", auth, clearAllNotifications);

module.exports = router;
