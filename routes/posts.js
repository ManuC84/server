var express = require("express");
const { get } = require("mongoose");
var router = express.Router();
var { getPosts, createPost } = require("../controllers/posts.js");

router.get("/", getPosts);

router.post("/", createPost);

module.exports = router;
