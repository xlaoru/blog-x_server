const User = require("../models/user.model");

module.exports = function (roles) {
    return async function (req, res, next) {
        try {
            if (!req.user) {
                return res.status(403).json({ message: "User is not authorized" });
            }

            const user = await User.findById(req.user.id);
            const isAdminOrOwner = user.role === "ADMIN" || user.role === "OWNER";

            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: `Access denied: requires ${roles.join(", ")} role.`,  userRole: user.role, isAdminOrOwner });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};