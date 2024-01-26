const notFound = (req, res, next) => {
  const error = new Error(`unknown url - ${req.originalUrl}`);
  // error.message here is defines as "unknown url - req.originalUrl"
  error.code = 404;
  next(error);
};

module.exports = notFound;
