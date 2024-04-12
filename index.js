const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const Blog = require("./models/blog");

mongoose.connect("mongodb://127.0.0.1:27017/blogs")
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(e => {
        console.log("Error connecting!", e);
    });

app.use(express.json());

//@desc register a user
//@auth not required
//@route GET /auth/register
app.get("/auth/register", async (req, res) => {
    const { name, email, password } = req.body;

    //checking if all fields are present
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields mandatory.");
    }

    const checkUser = await User.findOne({ email });

    //checking if user is already registered
    if (checkUser) {
        res.status(400);
        throw new Error("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
        name,
        email,
        password: hashedPassword,
    });

    await user.save();

    console.log("Created user: ", user);

    if (user) {
        res.status(200).json({ message: "User registered successfully." });
    } else {
        res.status(400).json({ message: "User not created." });
    }
});

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
});