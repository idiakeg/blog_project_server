const { Schema, model } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      validate: [validator.isEmail, "Please enter a valid email."],
      unique: true,
      lowercase: true /* convert email to lowercase before saving */,
    },
    avatar: String,
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: 8,
    },
    confirm_password: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // this validator will only work for save and create, not when a document is to be updated.
        validator: function (value) {
          return value === this.password;
        },
        message: "Password and confirm_password do not match",
      },
    },
    no_of_posts: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "blog_users",
  }
);

// password encryption before saving
userSchema.pre("save", async function (next) {
  // check if the the password was modified, if it wasnot, do nothing
  if (!this.isModified("password")) {
    return next();
  }

  // if it was modified, encrypt it
  this.password = await bcrypt.hash(this.password, 12);

  // set the confirm password field to undefined so it is not saved in the database
  this.confirm_password = undefined;
});

const userModel = model("User", userSchema);

module.exports = userModel;
