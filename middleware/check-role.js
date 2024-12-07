const User = require("../models/user.model");

module.exports = function (role) {
    return async function (req, res, next) {
        if (!req.user) {
            return res.status(403).json({ message: "User is not authorized" });
        }

        try {
            const user = await User.findById(req.user.id);

            if (user.role !== role) {
                return res.status(403).json({ message: `Access denied: requires ${role} role.` });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}