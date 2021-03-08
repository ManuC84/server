const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/postMessage.js");
const { fetchMetadata } = require("../utils/fetchMetadata.js");

exports.createPost = async (req, res) => {
  const { url } = req.body;
  const { description, image, keywords, title, type } = await fetchMetadata(
    url
  );
  const newPost = new Post({
    title: title,
    description: description,
    url: url,
    image: image,
    keywords: keywords,
    type: type,
    createdAt: new Date().toISOString(),
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
