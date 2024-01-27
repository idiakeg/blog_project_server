const customErrorHandler = require("../utils/customErrorHandler");

const notFound = (req, res, next) => {
  const error = new customErrorHandler(
    `Can't find this url: ${req.originalUrl} on the server`,
    404
  );
  next(error);
};

module.exports = notFound;
