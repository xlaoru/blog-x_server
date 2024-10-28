const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth");

const { signup, login, refreshToken, getUser, editUser } = require("../controllers/auth-controller");

router.post("/signup", signup);

router.post("/login", login);

router.post("/refresh", refreshToken)

router.get("/user", isAuth, getUser)

router.put("/user", isAuth, editUser)

module.exports = router;
