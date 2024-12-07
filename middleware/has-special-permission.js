const User = require("../models/user.model");

module.exports = async function (req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        const { id } = req.params

        const hasSpecialPermission = user.blogs.includes(id);

        if (!hasSpecialPermission) {
            return res.status(403).json({ message: "You are not allowed to manipulate this blog" });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}