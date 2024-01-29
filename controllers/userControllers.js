const asyncErrorHandler = require("../utils/asyncErrorHandler");
const userModel = require("../models/userSchema");

// post request || /api/users/register || unprotected
// ----> Register new user
const regisiterUser = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = new Error("all fields are required");
    error.statusCode = 400;
    return next(error);
  }
  const newUser = await userModel.create(req.body);

  return res.status(200).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// post request || /api/users/login || unprotected
// -----> login a registered user, after a new user is registered, they are directed to then login
const loginUser = (req, res) => {
  res.json("login registered user route ");
};

// get request || /api/users/:id || protected
// -----> get the profile of a registered user
const getUser = (req, res) => {
  res.json("get user profile");
};

// post request || /api/users/change_avatar || protected
// ------> Change user avatar
const changeAvatar = (req, res) => {
  res.json("change user avatar");
};

// post request || /api/users/edit_user || protected
// ------> Edit user details
const editUser = (req, res) => {
  res.json("edit user details");
};

// get request || /api/users/ || unprotected
// ------> Get all authors/users
const getAuthors = (req, res) => {
  res.json("get all authors");
};

module.exports = {
  getAuthors,
  editUser,
  changeAvatar,
  loginUser,
  getUser,
  regisiterUser,
};
