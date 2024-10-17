const router = require("express").Router();

const { auth, allowRoles } = require("../../middleware/auth.mw");
const emailValidator = require("../../middleware/emailValidator.mw");
const {
  createSafeUpdateObject,
  validateObjectId,
} = require("../../middleware/update.mw");
const {
  getProjects,
  createNewProject,
  updateProject,
  toggleDeleteProject,
  toggleAuthUserForProject,
} = require("../controllers/project.controller");

router.get("/", [auth()], getProjects(true));
router.get("/authed", [auth()], getProjects(false));
router.post("/", [auth(), allowRoles("admin")], createNewProject);
router.put(
  "/:id",
  [
    validateObjectId,
    auth(),
    allowRoles("admin"),
    createSafeUpdateObject("project"),
  ],
  updateProject
);
router.put(
  "/authuser/:id",
  [validateObjectId, auth(), allowRoles("admin"), emailValidator(true)],
  toggleAuthUserForProject
);
router.delete(
  "/:id",
  [validateObjectId, auth(), allowRoles("admin")],
  toggleDeleteProject
);

module.exports = router;
