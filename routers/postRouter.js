const { Router } = require("express");
const router = Router();
const protectMiddleware = require("../middlewares/protect");

const {
  createPost,
  getPosts,
  getSinglePosts,
  getPostByCategory,
  getPostByAuthor,
  editPost,
  deletePost,
} = require("../controllers/postControllers");

router.get("/", getPosts);
router.get("/:id", getSinglePosts);
router.get("/categories/:category", getPostByCategory);
router.get("/user/:id", getPostByAuthor);
router.post("/", protectMiddleware, createPost);
router.patch("/:id", protectMiddleware, editPost);
router.delete("/:id", protectMiddleware, deletePost);

module.exports = router;
