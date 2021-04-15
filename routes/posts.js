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
const { addComments, addCommentReply } = require("../controllers/comments.js");
const { auth } = require("../middleware/auth.js");

router.get("/", getPosts);

router.post("/", body("url").isURL().withMessage("Invalid Url"), createPost);

router.get("/:id", getSinglePost);

router.get("/:id/comments");

router.post("/:id/comments", auth, addComments);

router.post("/:postId/comments/:commentId", auth, addCommentReply);

router.post("/tags", body("tags.*").trim().escape(), getPostsByTags);

router.post("/tags/addTags/:id", body("tag").trim().escape(), addTags);

router.post("/:postId/likes", likePost);

router.post("/:postId/dislikes", dislikePost);

module.exports = router;
