const router = require("express").Router();

const { loginLimiter } = require("../../middleware/rateLimiter.mw");
const emailValidator = require("../../middleware/emailValidator.mw");
const { auth, allowRoles, findOrg } = require("../../middleware/auth.mw");
const {
  createNewOrg,
  updateOrg,
  deleteOrg,
  getOrg,
} = require("../controllers/organization.controller");
const { createSafeUpdateObject } = require("../../middleware/update.mw");

router.post("/", [loginLimiter, emailValidator(true, "user")], createNewOrg);
router.put(
  "/",
  [
    auth(),
    allowRoles("owner"),
    findOrg(true),
    createSafeUpdateObject("organization"),
  ],
  updateOrg
);
router.delete("/", [auth(), allowRoles("owner"), findOrg(true)], deleteOrg);
router.get("/", [auth(), findOrg()], getOrg);

module.exports = router;
