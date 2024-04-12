const express = require("express");
const router = express.Router();
const { register_user, login_user } = require("../controller/userController");

//@desc register a user
//@auth not required
//@route POST /auth/register
router.post("/register", register_user);

//@desc login a user
//@auth not required
//@route POST /auth/login
router.post("/login", login_user);

module.exports = router;