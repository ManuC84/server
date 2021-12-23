const Post = require("../models/postMessage.js");
const { fetchMetadata, fetchLanguage } = require("../utils/fetchMetadata.js");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");

const AWS = require("aws-sdk");
const Comment = require("../models/comment.js");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
});
const s3 = new AWS.S3();
const bucket = process.env.AWS_BUCKET_NAME;

//GET ALL POSTS
exports.getPosts = async (req, res) => {
  try {
    const skip = req.query.skip && /^\d+$/.test(req.query.skip) ? Number(req.query.skip) : 0;

    let posts;
    let language = {};
    if (req.query.language) {
      language = { language: req.query.language };
    }

    if (!req.query.sort && !req.query.language)
      posts = await Post.find({}, undefined, { skip, limit: 10 }).sort({
        createdAt: -1,
      });

    if (req.query.sort) {
      if (req.query.sort === "new")
        posts = await Post.find(language, undefined, {
          skip,
          limit: 10,
        }).sort({
          createdAt: -1,
        });

      if (req.query.sort === "most-liked") {
        posts = await Post.aggregate([
          {
            $addFields: {
              likesLength: {
                $size: "$likes",
              },
            },
          },
          { $match: { likesLength: { $gt: 0 } } },
          { $match: language },
          {
            $sort: {
              likesLength: -1,
            },
          },

          { $skip: skip },
          {
            $limit: 10,
          },
        ]);
      }
      if (req.query.sort === "controversial") {
        posts = await Post.aggregate([
          {
            $addFields: {
              dislikesLength: {
                $size: "$dislikes",
              },
            },
          },
          {
            $sort: {
              dislikesLength: -1,
            },
          },
          { $match: { dislikesLength: { $gt: 0 } } },
          { $match: language },
          {
            $limit: 10,
          },
          { $skip: skip },
        ]);
      }
      if (req.query.sort === "hot") {
        posts = await Post.aggregate(
          [
            { $addFields: { post_id: { $toString: "$_id" } } },
            {
              $lookup: {
                from: "comments",
                localField: "post_id",
                foreignField: "parentPostId",
                as: "postComments",
              },
            },
            {
              $addFields: {
                commentsLength: {
                  $size: "$postComments",
                },
              },
            },
            {
              $sort: {
                commentsLength: -1,
              },
            },
            { $match: { commentsLength: { $gt: 0 } } },
            { $match: language },
            {
              $limit: 10,
            },
            { $skip: skip },
          ],
          (err, data) => {
            if (err) console.log(err);
          }
        );
      }
    }
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
  const { url: userUrl, creator, plugin } = req.body;

  const {
    description = "No description available",
    image,
    keywords,
    title = "No title available",
    type,
    url,
    provider,
    icon,
  } = await fetchMetadata(userUrl);

  const language = await fetchLanguage(userUrl);

  const tags = keywords && keywords.map((tag) => tag.toLowerCase());

  let screenshotUrl;

  const capture = async () => {
    const randomId = uuidv4();
    try {
      const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      const page = await browser.newPage();
      await page.goto(url);
      const screenShot = await page.screenshot();
      const params = {
        Bucket: bucket,
        Key: `${randomId}.png`,
        Body: screenShot,
      };
      await s3
        .upload(params)
        .promise()
        .then((data) => {
          console.log(data.Location);
          screenshotUrl = data.Location;
        });
      await browser.close();
    } catch (error) {
      console.log(error);
    }
  };

  if (!image) await capture();

  const newPost = new Post({
    title: title,
    description: description,
    url: url,
    image: image || screenshotUrl,
    tags: tags,
    type: type,
    provider: provider,
    icon: icon,
    creator: creator,
    createdAt: new Date().toISOString(),
    language,
  });

  try {
    //Must implement regex in order to avoid duplicates
    const existingPost = await Post.find({ url: url });

    if (existingPost.length) return res.status(201).json(existingPost);
  } catch (error) {
    console.log(error);
  }

  //Browser extension test to see if post already exists then exit the program
  if (plugin === "plugin-initial") return res.status(200).send();

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

  if (!userId || !postId)
    return res.status(400).json({
      errorMessage: "There seems to be an error, please try again later",
    });

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
