const asyncErrorHandler = require("../utils/asyncErrorHandler");
const customErrorHandler = require("../utils/customErrorHandler");
const jwt = require("jsonwebtoken");
const util = require("util");

const protectMiddleware = asyncErrorHandler(async (req, res, next) => {
  // 1. Read the token and check if it exists, if it does not exist in the request, the user is not logged in.
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("bearer")) {
    token = testToken.split(" ")[1];
  }

  if (!token) {
    const error = new customErrorHandler("You are not logged in!", 401);
    next(error);
  }
  // 2. Validate or verify the token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STRING
  );

  req.user = decodedToken;
  // 3. check if the user exists; incase user is deleted from the data base upon login
  // 4. if the user changed password after token was issued
  // 5. if all the above conditions are met, the user can then access the desired route
  next();
});

module.exports = protectMiddleware;
