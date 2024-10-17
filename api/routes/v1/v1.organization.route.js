const router = require("express").Router();

const { loginLimiter } = require("../../middleware/rateLimiter.mw");
const emailValidator = require("../../middleware/emailValidator.mw");

const auth = require("../../middleware/auth.mw");
const { createNewOrg } = require("../controllers/organization.controller");

router.post("/", [loginLimiter, emailValidator(true, "user")], createNewOrg);

module.exports = router;
