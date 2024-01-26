// post request || /api/users/register || unprotected
// ----> Register new user
const regisiterUser = (req, res) => {
  res.json("register user route");
};

// post request || /api/users/login || unprotected
// -----> login a registered user, after a new user is registered, they are directed to then login
const loginUser = (req, res) => {
  res.json("login registered user route ");
};

// get request || /api/users/:id || protected
// -----> get the profile of a registered user
const getUser = (req, res) => {
  res.json("get user profile");
};

// post request || /api/users/change_avatar || protected
// ------> Change user avatar
const changeAvatar = (req, res) => {
  res.json("change user avatar");
};

// post request || /api/users/edit_user || protected
// ------> Edit user details
const editUser = (req, res) => {
  res.json("edit user details");
};

// get request || /api/users/authors || unprotected
// ------> Get all authors/users
const getAuthors = (req, res) => {
  res.json("get all authors");
};

module.exports = {
  getAuthors,
  editUser,
  changeAvatar,
  loginUser,
  getUser,
  regisiterUser,
};
