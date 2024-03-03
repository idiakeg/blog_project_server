const { Router } = require("express");
const protectMiddleware = require("../middlewares/protect");

const router = Router();

const {
  getAuthors,
  editUser,
  changeAvatar,
  loginUser,
  getUser,
  regisiterUser,
} = require("../controllers/userControllers");

router.post("/register", regisiterUser);
router.post("/login", loginUser);
router.post("/change_avatar", protectMiddleware, changeAvatar);
router.patch("/edit_user", editUser);
router.get("/:id", getUser);
router.get("/", getAuthors);

module.exports = router;
