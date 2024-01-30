const asyncErrorHandler = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((error) => next(error));
  };
  // return async (req, res, next) => {
  //   try {
  //     await func(req, res, next);
  //   } catch (error) {
  //     next(error);
  //   }
  // };
};

module.exports = asyncErrorHandler;
