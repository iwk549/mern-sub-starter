const router = require("express").Router();

const { auth, allowRoles, findOrg } = require("../../middleware/auth.mw");
const emailValidator = require("../../middleware/emailValidator.mw");
const {
  getInvitations,
  inviteUser,
  deleteInvitation,
} = require("../controllers/invitation.controller");

router.get("/", [auth(), allowRoles("admin"), findOrg()], getInvitations);
router.post(
  "/",
  [auth(), allowRoles("admin"), findOrg(), emailValidator(true)],
  inviteUser
);
router.delete(
  "/:email",
  [
    auth(),
    allowRoles("admin"),
    findOrg(),
    emailValidator(true, false, "email"),
  ],
  deleteInvitation
);

module.exports = router;
