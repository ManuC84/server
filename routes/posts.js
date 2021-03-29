var express = require("express");
const { body } = require("express-validator");
var router = express.Router();
var {
  getPosts,
  createPost,
  getPostsByTags,
  addTags,
  getSinglePost,
} = require("../controllers/posts.js");

router.get("/", getPosts);

router.post("/", body("url").isURL().withMessage("Invalid Url"), createPost);

router.get("/post", getSinglePost);

router.post("/tags", body("tags.*").trim().escape(), getPostsByTags);

router.post("/tags/addTags/:id", body("tag").trim().escape(), addTags);

module.exports = router;
