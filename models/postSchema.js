const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the blog post"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "Agriculture",
          "Business",
          "Education",
          "Entertainment",
          "Art",
          "Investment",
          "Uncategorized",
          "Weather",
        ],
        message: "{VALUE} is not supported.",
        required: [true, "Please provide a category for the blog post"],
      },
    },
    description: {
      type: String,
      required: [true, "Please provide a description for the blog post"],
    },
    thumbnail: {
      type: String,
      required: [true, "Please provide a thumbnail for the blog post"],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "blog_users",
      required: [true, "Please provide the id of the creator of the blog post"],
    },
  },
  { timestamps: true, collection: "Posts" }
);

const postModel = model("Posts", postSchema);
module.exports = postModel;
