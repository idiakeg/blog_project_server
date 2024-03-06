const fs = require("fs");
const path = require("path");

const removeExistingAvatar = (user) => {
  fs.unlink(path.join(__dirname, "..", "uploads", user.avatar), (err) => {
    if (err) {
      return next(new customErrorHandler(err));
    }
  });
};

module.exports = removeExistingAvatar;
