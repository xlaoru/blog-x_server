const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth");
const isAllowedFor = require("../middleware/is-allowed-for");

const { signup, login, refreshToken, getUser, editUser, setAdmin, removeAdmin } = require("../controllers/auth-controller");

router.post("/signup", signup);

router.post("/login", login);

router.post("/refresh", refreshToken)

router.get("/user", isAuth, getUser)

router.put("/user", isAuth, editUser)

router.post("/set-admin", isAuth, isAllowedFor(["OWNER"]), setAdmin)

router.post("/remove-admin", isAuth, isAllowedFor(["OWNER"]), removeAdmin)

module.exports = router;
