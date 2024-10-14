const Router = require("express");
const router = new Router();

const isAuth = require("../middleware/is-auth");

const { signup, login, getUser } = require("../controllers/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/getUser", isAuth, getUser)

module.exports = router;
