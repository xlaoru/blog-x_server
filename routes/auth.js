const Router = require("express");
const router = new Router();

const { signup, login } = require("../controllers/auth");

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
