const customErrorHandler = require("../utils/customErrorHandler");

const devError = (res, err) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
    stackTrace: err.stack,
    error: err,
  });
};

const castErrorHandler = (err) => {
  // define the custom error message
  const msg = `Invalid value for ${err.path}: ${err.value}!`;
  return new customErrorHandler(msg, 400);
};

const duplicateKeyErrorHandler = (err) => {
  const msg = `User with email: ${err.keyValue.email} already exists in the database. Try a different email`;
  return new customErrorHandler(msg, 400);
};

const prodError = (res, err) => {
  // check if the error object has the isOperational property
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: "error",
      message: err.message || "Internal server error",
    });
  } else {
    /* if the error is not operational, or other forms of error, e.g the ones thrown by mongoose validator  */
    res.status(500).json({
      status: "error",
      message: "Something went wrong, please try again later.",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  // if running application in development environment
  if (process.env.NODE_ENV === "development") {
    devError(res, err);
  }

  // if running application in production environment
  if (process.env.NODE_ENV === "production") {
    // check if the name of the error is a cast error
    if (err.name === "castError") {
      // reassign the err object that was thrown by mongoose that had no status code, isOperational of false and gaunty error message to the sophisticated error message of the customErrorHandler
      err = castErrorHandler(err);
    }
    // if it is a duplicate key error
    if (err.code === 11000) {
      err = duplicateKeyErrorHandler(err);
    }
    prodError(res, err);
  }
};

module.exports = globalErrorHandler;
