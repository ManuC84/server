var express = require("express");
const { get } = require("mongoose");
var router = express.Router();
var {
  getPosts,
  createPost,
  getPostsByTags,
  addTags,
} = require("../controllers/posts.js");

router.get("/", getPosts);

router.post("/", createPost);

router.post("/tags", getPostsByTags);

router.post("/tags/addTags/:id", addTags);

module.exports = router;
