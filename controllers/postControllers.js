const customErrorHandler = require("../utils/customErrorHandler");
const { v4: uuid } = require("uuid");
const path = require("path");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const postModel = require("../models/postSchema");
const userModel = require("../models/userSchema");
const removeExistingAvatar = require("../utils/removeExistingAvatar");
const fileRename = require("../utils/fileRename");

// protected. api/posts =================== CREATE POSTS
const createPost = asyncErrorHandler(async (req, res, next) => {
    const { title, description, category } = req.body;
    const thumbnail = req.files?.thumbnail;

    if (!thumbnail) {
        return next(new customErrorHandler("Please include a thumbnail", 422));
    }

    //   check the size of the thumbnail
    if (thumbnail.size > 2000000) {
        return next(
            new customErrorHandler(
                "thumbnail too big. File size should be less than 2Mb.",
                422
            )
        );
    }

    //   rename the file to ensure unique naming of files in the DB
    let fileName = thumbnail.name;
    let splittedFileName = fileName.split(".");
    let newFileName =
        splittedFileName[0] +
        uuid() +
        "." +
        splittedFileName[splittedFileName.length - 1];

    // move the thumbnail into the upload folder
    thumbnail.mv(
        path.join(__dirname, "..", "uploads", newFileName),
        async (err) => {
            if (err) {
                return next(new customErrorHandler(err));
            }
        }
    );

    //  create the post
    const post = await postModel.create({
        title,
        description,
        category,
        thumbnail: newFileName,
        creator: req.user.id,
    });

    if (!post) {
        return next(new customErrorHandler("Post could not be created.", 422));
    }

    await userModel.findOneAndUpdate(
        { _id: req.user.id },
        { $inc: { no_of_posts: 1 } }
    );

    res.status(201).json({ status: "success", post });
});

// Unprotected. api/posts ================== GET ALL POSTS
const getPosts = asyncErrorHandler(async (req, res, next) => {
    const { page_number } = req.query;
    const limit = 6;
    const skip_count = (page_number - 1) * limit; // 6 is the limit
    console.log(page_number);
    const totalPosts = await postModel.countDocuments();
    if (skip_count >= totalPosts) {
        return next(new customErrorHandler("Page does not exist.", 400));
    }
    const posts = await postModel
        .find()
        .sort({ updatedAt: -1 })
        .populate("creator")
        .skip(skip_count)
        .limit(limit); // -1: descending(the one that was created or updated last or most recently will appear at the top). 1: ascending
    res.status(200).json({
        status: "success",
        totalPosts,
        pageNumber: page_number,
        posts,
    });
});

// Unprotected. api/posts/:id ================== GET SINGLE POST
const getSinglePosts = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const post = await postModel.findById(id).populate("creator");
    if (!post) {
        return next(new customErrorHandler("Post not found.", 422));
    }
    res.status(200).json({ status: "success", post });
});

// Unprotected. api/posts/categories/:category  ================== GET POST BY CATEGORY
const getPostByCategory = asyncErrorHandler(async (req, res, next) => {
    const { category } = req.params;
    const categoryPost = await postModel
        .find({ category })
        .sort({ updatedAt: -1 })
        .populate("creator");
    res.status(200).json({ status: "success", categoryPost });
});

// Unprotected. api/posts/user/:id  ================== GET POST BY AUTHOR
const getPostByAuthor = asyncErrorHandler(async (req, res, next) => {
    //   obtain the id of the author
    const { id } = req.params;
    const authorPosts = await postModel
        .find({ creator: id })
        .sort({ updatedAt: -1 })
        .populate("creator");
    res.status(200).json({ status: "success", authorPosts });
});

// protected. api/posts/:id (patch)  ==================  EDIT POST
const editPost = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const thumbnail = req.files?.thumbnail;
    let editedPost;

    // because of the react quill that is being used, a decription length of less than 12 characters means that the field is empty. React quill has a pararaph opening and closing tag with a break tag, so there are 11 characters in there already.
    if (!title || !description || description.length < 12 || !category) {
        return next(new customErrorHandler("All fields are required.", 422));
    }

    // get the actual blog post
    const oldBlogPost = await postModel.findById(id);
    // make sure that a user can only delete a post that they created.
    if (req.user.id == oldBlogPost.creator) {
        // make it possible to update a blog post without updating the thumbnail

        if (!thumbnail) {
            editedPost = await postModel.findByIdAndUpdate(
                id,
                { title, category, description },
                { new: true }
            );

            if (!editedPost) {
                return next(
                    new customErrorHandler("Could not update post", 422)
                );
            }

            return res.status(200).json({ status: "success", editedPost });
        }

        // if the user wants to also edit the thumbnail of the blog post
        // delete the old thumbnail
        removeExistingAvatar(oldBlogPost, "blog");
        // upload a new thumbnail
        // check file size
        if (thumbnail.size > 2000000) {
            return next(
                new customErrorHandler(
                    "Thumbnail too large. Should be less than 2Mb",
                    422
                )
            );
        }
        // rename the file
        const newFileName = fileRename(thumbnail);
        //   move the file into the uploads folder
        thumbnail.mv(
            path.join(__dirname, "..", "uploads", newFileName),
            (err) => {
                if (err) {
                    return next(new customErrorHandler(err));
                }
            }
        );
        // update the blog post with the new details
        editedPost = await postModel.findByIdAndUpdate(
            id,
            {
                title,
                description,
                category,
                thumbnail: newFileName,
            },
            { new: true }
        );

        if (!editedPost) {
            return next(new customErrorHandler("Could not update post", 422));
        }

        return res.status(200).json({ status: "success", editedPost });
    }

    res.status(400).json({
        status: "error",
        msg: "You cannot edit someone else's post.",
    });
});

// protected. api/posts/:id (delete)  ==================  DELETE POST
const deletePost = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    // console.log(req.user.id);
    if (!id) {
        return next(new customErrorHandler("Please provide and id", 422));
    }
    // find the post with the specified id
    const post = await postModel.findById(id);
    if (!post) {
        return next(new customErrorHandler("Post does not exist", 422));
    }
    // make sure that currently logged in user is the creator of the post with the id provided
    if (req.user.id == post.creator) {
        // delete the thumbnail
        removeExistingAvatar(post, "blog");
        // delete the post from the database
        await postModel.findByIdAndDelete(id);
        // find user and reduce the post count by 1
        await userModel.findOneAndUpdate(
            { _id: req.user.id },
            { $inc: { no_of_posts: -1 } }
        );

        return res.status(200).json({ status: "success" });
    }

    res.status(400).json({
        status: "error",
        msg: "You can not delete someone else's post",
    });
});

module.exports = {
    createPost,
    getPosts,
    getSinglePosts,
    getPostByCategory,
    getPostByAuthor,
    editPost,
    deletePost,
};
