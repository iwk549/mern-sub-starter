const router = require("express").Router();

const { loginLimiter } = require("../../middleware/rateLimiter.mw");
const emailValidator = require("../../middleware/emailValidator.mw");
const auth = require("../../middleware/auth.mw");

const {
  registerUser,
  refreshUserInfo,
  deleteUser,
  updateUser,
} = require("../controllers/user.controller");

router.post("/", [loginLimiter, emailValidator(true)], registerUser);
router.get("/", [auth()], refreshUserInfo);
router.delete("/", [auth()], deleteUser);
router.put("/", [auth()], updateUser);

module.exports = router;
