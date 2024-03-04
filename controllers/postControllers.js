const asyncErrorHandler = require("../utils/asyncErrorHandler");

// protected. api/posts =================== CREATE POSTS
const createPosts = asyncErrorHandler(async (req, res, next) => {
  res.json("create posts");
});

// Unprotected. api/posts ================== GET ALL POSTS
const getPosts = asyncErrorHandler(async (req, res, next) => {
  res.json("get all posts");
});

// Unprotected. api/posts/:id ================== GET SINGLE POST
const getSinglePosts = asyncErrorHandler(async (req, res, next) => {
  res.json("get single post");
});

// Unprotected. api/posts/categories/:category  ================== GET POST BY CATEGORY
const getPostByCategory = asyncErrorHandler(async (req, res, next) => {
  res.json("get posts by category");
});

// Unprotected. api/posts/user/:id  ================== GET POST BY AUTHOR
const getPostByAuthor = asyncErrorHandler(async (req, res, next) => {
  res.json("get posts by author");
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
  createPosts,
  getPosts,
  getSinglePosts,
  getPostByCategory,
  getPostByAuthor,
  editPost,
  deletePost,
};
