const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const { verify_token } = require("../middleware");
const fs = require("fs");
const path = require("path");

//@desc create a blog 
//@auth required
//@route POST /blog/create
router.post("/create", verify_token, async (req, res) => {
    try {
        const blog = new Blog(req.body);
        blog.poster = req.user.id; //associating blog with user

        //pushing poem to associated user
        req.user.blogs.push(blog);
        await blog.save();

        //generating unique file name
        const filename = `${blog._id}.docx`;

        const filePath = path.join(__dirname, "../blogs", filename);
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
router.get("/read", verify_token, async (req, res) => {
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
router.delete("/:id", verify_token, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user._id;

        await User.findByIdAndUpdate(user_id, { $pull: { blogs: id } });
        await Blog.findByIdAndDelete(id);

        //deleting the corresponding .docx file
        const filePath = path.join(__dirname, "../blogs", `${id}.docx`);
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
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updated_body = req.body;
        const blog = await Blog.findByIdAndUpdate(id, updated_body, { new: true });

        if (!blog) {
            return res.status(500).json({ message: "Blog not found." });
        }

        // Update the contents of the corresponding .docx file
        const filePath = path.join(__dirname, "../blogs", `${id}.docx`);
        const content = ` ${blog.blog}`;

        fs.writeFileSync(filePath, content);

        res.status(200).json({ message: "Updated successfully", blog });
    } catch (err) {
        console.log("Error updating blog.", err);
        res.status(500).json({ message: "Internal server error," });
    }
});

module.exports = router;