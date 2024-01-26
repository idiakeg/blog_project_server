const express = require("express");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT;

const connectToDB = require("./db_connection");

const app = express();

async function start() {
  try {
    await connectToDB();

    app.listen(port, () => console.log(`server running on port ${port}`));
  } catch (error) {
    console.log("problem connecting to DB", error);
  }
}

// start the application
start();
