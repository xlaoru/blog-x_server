const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth");
const checkRole = require("../middleware/check-role");

const { signup, login, refreshToken, getUser, editUser, setAdmin, removeAdmin } = require("../controllers/auth-controller");

router.post("/signup", signup);

router.post("/login", login);

router.post("/refresh", refreshToken)

router.get("/user", isAuth, getUser)

router.put("/user", isAuth, editUser)

router.post("/set-admin", isAuth, checkRole('OWNER'), setAdmin)

router.post("/remove-admin", isAuth, checkRole('OWNER'), removeAdmin)

module.exports = router;
