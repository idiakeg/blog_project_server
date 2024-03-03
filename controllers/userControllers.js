const asyncErrorHandler = require("../utils/asyncErrorHandler");
const userModel = require("../models/userSchema");
const customErrorHandler = require("../utils/customErrorHandler");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// post request || /api/users/register || unprotected
// ----> Register new user
const regisiterUser = asyncErrorHandler(async (req, res, next) => {
  const newUser = await userModel.create(req.body);

  return res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// post request || /api/users/login || unprotected
// -----> login a registered user, after a new user is registered, they are directed to then login
const loginUser = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // the token will be sent to the client after a successful login
  if (!email || !password) {
    let error = new customErrorHandler(
      "Please provide email and password for login",
      400
    );
    return next(error);
  }

  // check if the a user with the provided email exists in the database
  const user = await userModel.findOne({ email }).select("+password"); //here, we do get the user's password, because we need it to verify that the user provided the right information on login. This is okay because in the response we would not actually be sending the user object, but in other routes where the select will not be included, the user's password will not be visible

  const isMatch = await user?.comparePassword(password, user.password);

  if (!user || !isMatch) {
    let error = new customErrorHandler("Incorrect email or password", 400);
    return next(error);
  }

  const token = jwt.sign(
    { id: user._id, name: user.name },
    process.env.SECRET_STRING,
    {
      expiresIn: process.env.EXPIRES_IN,
    }
  );

  res.status(200).json({
    status: "success",
    token,
  });
});

// get request || /api/users/:id || protected
// -----> get the profile of a registered user
const getUser = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById(id);

  if (!user) {
    const error = new customErrorHandler("User not found!", 404);
    return next(error);
  }
  res.status(200).json({ user });
});

// post request || /api/users/change_avatar || protected
// ------> Change user avatar
const changeAvatar = asyncErrorHandler(async (req, res, next) => {
  const image = req.files.avatar;

  if (!image) {
    const error = new customErrorHandler("Please provide an image", 422);
    next(error);
    return;
  }

  // find the user in the database
  const user = await userModel.findById(req.user.id); //recall that req.user was set in the protect mosule and it equals the payload present in the JWT, which in this case is the name and id of the user

  // if an avatar exists, delete it.
  if (user.avatar) {
    fs.unlink(path.join(__dirname, "..", "uploads", user.avatar), (err) => {
      return new customErrorHandler(err);
    });
  }

  // check the size of the image and rename it before uploading
  // console.log(file);
  res.status(200).json(image);
});

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
