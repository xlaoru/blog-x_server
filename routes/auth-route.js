const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth");
const isAllowedFor = require("../middleware/is-allowed-for");
const isBanned = require("../middleware/is-banned");

const { signup, login, refreshToken, getUser, editUser, banUser, unbanUser, setAdmin, removeAdmin } = require("../controllers/auth-controller");

router.post("/signup", signup);

router.post("/login", login);

router.post("/refresh", refreshToken)

router.get("/user", isAuth, getUser)

router.put("/user", isBanned, isAuth, editUser)

router.post("/user/ban/:id", isAuth, isBanned, isAllowedFor(["OWNER", "ADMIN"]), banUser)

router.post("/user/unban/:id", isAuth, isBanned, isAllowedFor(["OWNER", "ADMIN"]), unbanUser)

router.post("/set-admin/:id", isAuth, isAllowedFor(["OWNER"]), setAdmin)

router.post("/remove-admin/:id", isAuth, isAllowedFor(["OWNER"]), removeAdmin)

module.exports = router;
