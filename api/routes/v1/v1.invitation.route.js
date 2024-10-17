const router = require("express").Router();

const { auth, allowRoles } = require("../../middleware/auth.mw");
const emailValidator = require("../../middleware/emailValidator.mw");
const {
  getInvitations,
  inviteUser,
  deleteInvitation,
} = require("../controllers/invitation.controller");

router.get("/", [auth(), allowRoles("admin")], getInvitations);
router.post(
  "/",
  [auth(), allowRoles("admin"), emailValidator(true)],
  inviteUser
);
router.delete(
  "/:email",
  [auth(), allowRoles("admin"), emailValidator(true, false, "email")],
  deleteInvitation
);

module.exports = router;
