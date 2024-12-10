const User = require("../models/user.model");

module.exports = async function (req, res, next) {
    try {
        const user = await User.findById(req.user.id);

        if (user.isBanned) {
            return res.status(403).json({ message: "You are banned." });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}