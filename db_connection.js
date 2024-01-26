const { connect } = require("mongoose");

const connectToDB = async () => {
  const uri = process.env.MONGO_URI;
  const client = await connect(uri);

  console.log("connected to DB");
  return client;
};

module.exports = connectToDB;
