const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret_key = "somesecretkey";
const User = require("../models/user");

//@desc register a user
//@auth not required
//@route POST /auth/register
module.exports.register_user = async (req, res) => {
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
};

//@desc login a user
//@auth not required
//@route POST /auth/login
module.exports.login_user = async (req, res) => {
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

};