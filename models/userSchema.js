const { Schema, model } = require("mongoose");
const validator = require("validator");

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
    no_of_posts: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "blog_users",
  }
);

const userModel = model("User", userSchema);
