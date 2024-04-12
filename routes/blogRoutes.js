const express = require("express");
const router = express.Router();
const { verify_token } = require("../middleware");
const { create_blog, read_blog, delete_blog, update_blog } = require("../controller/blogController");

//@desc create a blog 
//@auth required
//@route POST /blog/create
router.post("/create", verify_token, create_blog);

//@desc read your blogs
//@auth required
//@route GET /blog/read
router.get("/read", verify_token, read_blog);

//@desc delete your blog
//@auth required
//@route DELETE /blog/:id
router.delete("/:id", verify_token, delete_blog);

//@desc update your blog
//@auth required
//@route PUT /blog/:id
router.put("/:id", update_blog);

module.exports = router;