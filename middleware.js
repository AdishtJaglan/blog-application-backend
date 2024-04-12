const jwt = require("jsonwebtoken");
const secret_key = "somesecretkey";

//middleware to verify access token
module.exports.verify_token = (req, res, next) => {
    const auth_header = req.headers["authorization"];

    if (!auth_header) {
        return res.status(401).json({ message: "Token missing." });
    }

    const token = auth_header.split(" ")[1];

    jwt.verify(token, secret_key, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }

        req.user = decoded;
        next();
    });
};