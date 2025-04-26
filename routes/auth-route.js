const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth");
const isAllowedFor = require("../middleware/is-allowed-for");
const isBanned = require("../middleware/is-banned");

const { signup, login, refreshToken, getUser, getUsers, editUser, banUser, unbanUser, setAdmin, removeAdmin, eventsControl } = require("../controllers/auth-controller");

router.post("/signup", signup);

router.post("/login", login);

router.get("/connect", eventsControl)

router.post("/refresh", refreshToken)

router.get("/users", isAuth, isBanned, isAllowedFor(["OWNER", "ADMIN"]), getUsers)

router.get("/user", isAuth, getUser)

router.put("/user", isAuth, isBanned, editUser)

router.put("/user/ban/:id", isAuth, isBanned, isAllowedFor(["OWNER", "ADMIN"]), banUser)

router.put("/user/unban/:id", isAuth, isBanned, isAllowedFor(["OWNER", "ADMIN"]), unbanUser)

router.put("/user/set-admin/:id", isAuth, isBanned, isAllowedFor(["OWNER"]), setAdmin)

router.put("/user/remove-admin/:id", isAuth, isBanned, isAllowedFor(["OWNER"]), removeAdmin)

module.exports = router;
