const router = require("express").Router();

const { loginLimiter } = require("../../middleware/rateLimiter.mw");
const emailValidator = require("../../middleware/emailValidator.mw");

const { login, logout } = require("../controllers/auth.controller");
const { auth } = require("../../middleware/auth.mw");

router.post("/", [loginLimiter, emailValidator(true)], login);
router.post("/logout", [auth(true)], logout);

module.exports = router;
