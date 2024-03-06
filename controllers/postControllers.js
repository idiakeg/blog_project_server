const customErrorHandler = require("../utils/customErrorHandler");
const { v4: uuid } = require("uuid");
const path = require("path");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const postModel = require("../models/postSchema");
const userModel = require("../models/userSchema");

// protected. api/posts =================== CREATE POSTS
const createPost = asyncErrorHandler(async (req, res, next) => {
  const { title, description, category } = req.body;
  const { thumbnail } = req.files;

  //   check the size of the thumbnail
  if (thumbnail > 2000000) {
    return next(
      new customErrorHandler(
        "thumbnail too big. File size should be less than 2Mb.",
        422
      )
    );
  }

  //   rename the file to ensure unique naming of files in the DB
  let fileName = thumbnail.name;
  let splittedFileName = fileName.split(".");
  let newFileName =
    splittedFileName[0] +
    uuid() +
    "." +
    splittedFileName[splittedFileName.length - 1];

  // move the thumbnail into the upload folder
  thumbnail.mv(
    path.join(__dirname, "..", "uploads", newFileName),
    async (err) => {
      if (err) {
        return next(new customErrorHandler(err));
      }
    }
  );

  //  create the post
  const post = await postModel.create({
    title,
    description,
    category,
    thumbnail: newFileName,
    creator: req.user.id,
  });

  if (!post) {
    return next(new customErrorHandler("Post could not be created.", 422));
  }

  //   increse post count for user theat created the post
  const user = await userModel.findById(req.user.id);
  const postCount = user.no_of_posts + 1;
  // update the user post count with the new post count
  await userModel.findByIdAndUpdate(req.user.id, {
    no_of_posts: postCount,
  });

  res.status(201).json(post);
});

// Unprotected. api/posts ================== GET ALL POSTS
const getPosts = asyncErrorHandler(async (req, res, next) => {
  const posts = await postModel.find().sort({ updatedAt: 1 }); // -1: descending(the one that was created or updated last will or most recently will appear at the top). 1: ascending
  res.status(200).json(posts);
});

// Unprotected. api/posts/:id ================== GET SINGLE POST
const getSinglePosts = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await postModel.findById(id);
  if (!post) {
    return next(new customErrorHandler("Post not found.", 422));
  }
  res.status(200).json(post);
});

// Unprotected. api/posts/categories/:category  ================== GET POST BY CATEGORY
const getPostByCategory = asyncErrorHandler(async (req, res, next) => {
  const { category } = req.params;
  const categoryPost = await postModel
    .find({ category })
    .sort({ updatedAt: -1 });
  res.status(200).json(categoryPost);
});

// Unprotected. api/posts/user/:id  ================== GET POST BY AUTHOR
const getPostByAuthor = asyncErrorHandler(async (req, res, next) => {
  //   obtain the id of the author
  const { id } = req.params;
  const authorPosts = await postModel
    .find({ creator: id })
    .sort({ updatedAt: -1 });
  res.status(200).json(authorPosts);
});

// protected. api/posts/:id (patch)  ==================  EDIT POST
const editPost = asyncErrorHandler(async (req, res, next) => {
  res.json("edit post");
});

// protected. api/posts/:id (delete)  ==================  DELETE POST
const deletePost = asyncErrorHandler(async (req, res, next) => {
  res.json("delete post");
});

module.exports = {
  createPost,
  getPosts,
  getSinglePosts,
  getPostByCategory,
  getPostByAuthor,
  editPost,
  deletePost,
};
