const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT;
const connectToDB = require("./db_connection");
const app = express();
const upload = require("express-fileupload");

const userRouter = require("./routers/userRouter");
const postRouter = require("./routers/postRouter");
const notFound = require("./middlewares/notFound");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
// middleware definitions
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:3000", "http://localhost:3001"],
    })
);
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(upload());
app.use("/uploads", express.static(__dirname + "/uploads"));

// route definitions
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

app.use(notFound);
app.use(globalErrorHandler);

// console.log(process.env);

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
