const router = require("express").Router();

const { auth } = require("../../middleware/auth.mw");
const { createSafeUpdateObject } = require("../../middleware/update.mw");

const {
  refreshUserInfo,
  deleteUser,
  updateUser,
  getUserAccounts,
} = require("../controllers/user.controller");

router.get("/", [auth()], refreshUserInfo);
router.get("/accounts", [auth()], getUserAccounts);
router.delete("/", [auth()], deleteUser);
router.put("/", [auth(), createSafeUpdateObject("account")], updateUser);

module.exports = router;
