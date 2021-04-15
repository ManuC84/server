const Post = require("../models/postMessage.js");
const { fetchMetadata } = require("../utils/fetchMetadata.js");

//GET ALL POSTS
exports.getPosts = async (req, res) => {
  try {
    const skip =
      req.query.skip && /^\d+$/.test(req.query.skip)
        ? Number(req.query.skip)
        : 0;
    const posts = await Post.find({}, undefined, { skip, limit: 6 }).sort({
      createdAt: -1,
    });
    //Fetch all at once: const posts = await Post.find().limit(10).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//GET SINGLE POST
exports.getSinglePost = async (req, res) => {
  const { id: postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ error: "This page doesn't exist" });

  try {
    res.status(201).json([post]);
  } catch (error) {
    console.log(error);
  }
};

//CREATE POSTS OR FETCH IF ALREADY IN DATABASE
exports.createPost = async (req, res) => {
  const { url: userUrl, creator } = req.body;

  const {
    description = "No description available",
    image = "/images/no-image.png",
    keywords,
    title = "No title available",
    type,
    url,
    provider,
    icon,
  } = await fetchMetadata(userUrl);

  const tags = keywords && keywords.map((tag) => tag.toLowerCase());

  const newPost = new Post({
    title: title,
    description: description,
    url: url,
    image: image,
    tags: tags,
    type: type,
    provider: provider,
    icon: icon,
    creator: creator,
    createdAt: new Date().toISOString(),
  });

  //Must implement regex in order to avoid duplicates
  const existingPost = await Post.find({ url: url });

  if (existingPost.length) {
    res.status(201).json(existingPost);
    return;
  }

  try {
    await newPost.save();
    res.status(201).json([newPost]);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

//GET POSTS BY TAGS
exports.getPostsByTags = async (req, res) => {
  try {
    const { tags } = req.body;
    console.log(tags);
    const lowerCaseTags = tags.map((tag) => tag.toLowerCase());
    const taggedPosts = await Post.find({ tags: { $all: lowerCaseTags } });

    if (taggedPosts.length > 0) {
      res.status(200).json(taggedPosts);
    } else {
      res.status(404).json({
        message: "Your search yielded no results, please try again",
      });
    }
  } catch (error) {
    res.status(404).json({ errorMessage: error.message });
  }
};

//ADD TAGS TO POST
exports.addTags = async (req, res) => {
  const { tag } = req.body;
  const { id } = req.params;

  const lowerCaseTag = tag.toLowerCase();
  const post = await Post.findById(id);
  if (!post.tags.includes(lowerCaseTag)) {
    post.tags.unshift(lowerCaseTag);
  } else {
    res.status(404).json({
      addTagError: "This tag already exists",
      postId: post._id,
    });
    return;
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

//LIKE POSTS
exports.likePost = async (req, res) => {
  const { userId } = req.body;
  const { postId } = req.params;

  const post = await Post.findById(postId);

  const likeIndex = post.likes.findIndex((id) => id === String(userId));
  const dislikeIndex = post.dislikes.findIndex((id) => id === String(userId));

  if (dislikeIndex !== -1) {
    post.dislikes = post.dislikes.filter((id) => id !== String(userId));
  }

  if (likeIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes = post.likes.filter((id) => id !== String(userId));
  }

  try {
    await Post.findByIdAndUpdate(postId, post, { new: true });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

//DISLIKE POSTS
exports.dislikePost = async (req, res) => {
  const { userId } = req.body;
  const { postId } = req.params;

  const post = await Post.findById(postId);

  const dislikeIndex = post.dislikes.findIndex((id) => id === String(userId));
  const likeIndex = post.likes.findIndex((id) => id === String(userId));

  if (likeIndex !== -1) {
    post.likes = post.likes.filter((id) => id !== String(userId));
  }

  if (dislikeIndex === -1) {
    post.dislikes.push(userId);
  } else {
    post.dislikes = post.dislikes.filter((id) => id !== String(userId));
  }

  try {
    await Post.findByIdAndUpdate(postId, post, { new: true });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
