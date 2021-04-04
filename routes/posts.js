const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  getPosts,
  createPost,
  getPostsByTags,
  addTags,
  getSinglePost,
} = require("../controllers/posts.js");
const { addComments, getComments } = require("../controllers/comments.js");

router.get("/", getPosts);

router.post("/", body("url").isURL().withMessage("Invalid Url"), createPost);

router.get("/:id", getSinglePost);

router.get("/:id/comments");

router.get("/:id/comments", getComments);

router.post("/:id/comments", addComments);

router.post("/tags", body("tags.*").trim().escape(), getPostsByTags);

router.post("/tags/addTags/:id", body("tag").trim().escape(), addTags);

module.exports = router;
