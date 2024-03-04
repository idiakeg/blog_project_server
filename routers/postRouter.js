const { Router } = require("express");

const router = Router();

const {
  createPosts,
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
router.post("/", createPosts);
router.patch("/:id", editPost);
router.delete("/:id", deletePost);

module.exports = router;
