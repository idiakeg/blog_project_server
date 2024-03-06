const asyncErrorHandler = require("../utils/asyncErrorHandler");
const userModel = require("../models/userSchema");
const customErrorHandler = require("../utils/customErrorHandler");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");
const fileRename = require("../utils/fileRename");
const removeExistingAvatar = require("../utils/removeExistingAvatar");

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
    removeExistingAvatar(user);
  }

  //check the file size of the avatar. note 1000bytes =1kb, 500000bytes = 500kb.
  if (image.size > 500000) {
    return next(
      new customErrorHandler(
        "Profile picture too big. Should be less than 500kb",
        422
      )
    );
  }

  // if the file size is within range, change the name of the file, to ensure uniqueness.
  const newFileName = fileRename(image);

  // upload the file. use the mv function to move
  image.mv(path.join(__dirname, "..", "uploads", newFileName), async (err) => {
    if (err) {
      return next(new customErrorHandler(err));
    }
  });

  const updatedAvatar = await userModel.findByIdAndUpdate(
    req.user.id,
    {
      avatar: newFileName,
    },
    { new: true }
  );

  if (!updatedAvatar) {
    return next(new customErrorHandler(err));
  }

  res.status(200).json(updatedAvatar);
});

// post request || /api/users/edit_user || protected
// ------> Edit user details
const editUser = asyncErrorHandler(async (req, res, next) => {
  const { name, email, currentPassword, newPassword, newConfirmPassword } =
    req.body;
  if (!email || !name || !currentPassword || !newPassword) {
    return next(new customErrorHandler("Fill in all fields.", 422));
  }
  // find the user based on the id provided by the protect middleware
  const user = await userModel.findById(req.user.id).select("+password");
  if (!user) {
    return next(new customErrorHandler("User not found.", 403));
  }

  // make sure a user with the provded email doesnot exist
  const emailExists = await userModel.findOne({ email });
  if (emailExists && emailExists._id.toString() !== req.user.id) {
    //essentially checks if a user with the provided id exists and whether or not it is the logged in user. this will prevent one user from changing the email of another user
    return next(new customErrorHandler("Email already  exist.", 422));
  }

  // compare passwords
  const isMatch = await user.comparePassword(currentPassword, user.password); //this is here to ensure that for a user to change her password, they must first provide the currentpassword
  if (!isMatch) {
    return next(new customErrorHandler("Invalid current password.", 422));
  }

  // compare new password and current password
  if (newPassword !== newConfirmPassword) {
    return next(new customErrorHandler("New password does not match", 422));
  }

  // hash the password:
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // update user information
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user.id,
    { name, email, password: hashedPassword },
    { new: true }
  );

  res.status(200).json(updatedUser);
});

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
