const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth");

const { signup, login, getUser, editUser } = require("../controllers/auth");

router.post("/signup", signup);

router.post("/login", login);

router.get("/user", isAuth, getUser)

router.put("/user", isAuth, editUser)

module.exports = router;
