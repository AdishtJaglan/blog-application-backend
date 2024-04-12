const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const Blog = require("./models/blog");
const secret_key = "somesecretkey";
const { verify_token } = require("./middleware");
const fs = require("fs");
const path = require("path");

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
//@route POST /auth/register
app.post("/auth/register", async (req, res) => {
    const { name, email, password } = req.body;

    //checking if all fields are present
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields mandatory.");
    }

    const check_user = await User.findOne({ email });

    //checking if user is already registered
    if (check_user) {
        res.status(400);
        throw new Error("User already exists.");
    }

    const hashed_password = await bcrypt.hash(password, 12);
    const user = new User({
        name,
        email,
        password: hashed_password,
    });

    await user.save();

    console.log("Created user: ", user);

    if (user) {
        return res.status(200).json({ message: "User registered successfully." });
    } else {
        return res.status(400).json({ message: "User not created." });
    }
});

//@desc login a user
//@auth not required
//@route POST /auth/login
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    //checking if user exists
    if (!user) {
        return res.status(403).json({ message: "User does not exist." });
    }

    const compare_password = await bcrypt.compare(password, user.password);

    //comparing passwords
    if (!compare_password) {
        return res.status(403).json({ message: "Invalid credentials." });
    }

    //issuing access token
    const access_token = jwt.sign({
        name: user.name,
        email: user.email,
        id: user.id,
        blogs: user.blogs || [],
    },
        secret_key,
        { expiresIn: "15m" }
    );

    //issuing refresh token
    const refresh_token = jwt.sign({
        name: user.name,
        email: user.email,
        id: user.id,
        blogs: user.blogs || [],
    },
        secret_key,
        { expiresIn: "7d" }
    );

    res.json({ access: access_token, refresh: refresh_token })
});

//@desc create a blog 
//@auth required
//@route POST /blog/create
app.post("/blog/create", verify_token, async (req, res) => {
    try {
        const blog = new Blog(req.body);
        blog.poster = req.user.id; //associating blog with user

        //pushing poem to associated user
        req.user.blogs.push(blog);
        await blog.save();

        //generating unique file name
        const filename = `${blog._id}.docx`;

        const filePath = path.join(__dirname, 'blogs', filename);
        fs.writeFileSync(filePath, req.body.blog);

        res.status(200).json({ message: "Created blog successfully", blog: blog });
    } catch (err) {
        console.log("Error creating blog: ", err);
        res.status(500).json({ message: "Error creating blog." });
    }
});

//@desc read your blogs
//@auth required
//@route GET /blog/read
app.get("/blog/read", verify_token, async (req, res) => {
    try {
        const blogs = await Blog.find({ user: req.user._id });
        console.log(blogs);

        res.json({ blogs: blogs, author: req.user._id });
    } catch (err) {
        console.log("Error retrieving blogs: ", err);
        res.status(500).json({ message: "Internal server error." });
    }
});

//@desc delete your blog
//@auth required
//@route DELETE /blog/:id
app.delete("/blog/:id", verify_token, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user._id;

        await User.findByIdAndUpdate(user_id, { $pull: { blogs: id } });
        await Blog.findByIdAndDelete(id);

        //deleting the corresponding .docx file
        const filePath = path.join(__dirname, "blogs", `${id}.docx`);
        fs.unlinkSync(filePath);

        res.status(200).json({ message: "Deleted successfully." });
    } catch (err) {
        console.log("Unable to delete: ", err);
        res.status(500).json({ message: "Internal server error." });
    }
});

//@desc update your blog
//@auth required
//@route PUT /blog/:id
app.put("/blog/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updated_body = req.body;
        const blog = await Blog.findByIdAndUpdate(id, updated_body, { new: true });

        if (!blog) {
            return res.status(500).json({ message: "Blog not found." });
        }

        // Update the contents of the corresponding .docx file
        const filePath = path.join(__dirname, "blogs", `${id}.docx`);
        const content = ` ${blog.blog}`;

        fs.writeFileSync(filePath, content);

        res.status(200).json({ message: "Updated successfully", blog });
    } catch (err) {
        console.log("Error updating blog.", err);
        res.status(500).json({ message: "Internal server error," });
    }
});

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
});