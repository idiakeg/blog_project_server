const fs = require("fs");
const path = require("path");
const customErrorHandler = require("./customErrorHandler");

const removeExistingAvatar = (user, blog) => {
  return (req, res, next) => {
    const fileToBeRemoved = blog ? user.thumbnail : user.avatar;
    fs.unlink(path.join(__dirname, "..", "uploads", fileToBeRemoved), (err) => {
      if (err) {
        return next(new customErrorHandler(err));
      }
    });
  };
};

module.exports = removeExistingAvatar;
