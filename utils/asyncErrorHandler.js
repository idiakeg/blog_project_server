const asyncErrorHandler = (func) => {
  return () => {
    try {
      func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
