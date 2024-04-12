const express = require("express");
const app = express();
const mongoose = require("mongoose");

const user_routes = require("./routes/userRoutes");
const blog_routes = require("./routes/blogRoutes");

mongoose.connect("mongodb://127.0.0.1:27017/blogs")
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(e => {
        console.log("Error connecting!", e);
    });

app.use(express.json());
app.use("/auth", user_routes);
app.use("/blog", blog_routes);

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
});