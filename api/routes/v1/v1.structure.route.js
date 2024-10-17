const router = require("express").Router();

const { auth, allowRoles } = require("../../middleware/auth.mw");
const {
  createSafeUpdateObject,
  validateObjectId,
} = require("../../middleware/update.mw");
const {
  getStructures,
  getStructure,
  createStructure,
  updateStructure,
  checkinStructure,
  deleteStructure,
} = require("../controllers/structure.controller");

router.get("/project/:id", [validateObjectId, auth()], getStructures);
// getting a structure by id will check it out to that user if not already checked out
router.get("/:id", [validateObjectId, auth()], getStructure());
router.get(
  "/force/:id",
  [validateObjectId, auth(), allowRoles("admin")],
  getStructure(true)
);

// structure is checked in when:
// - updated with the checkin=true query param
// - checkin route is used
router.put("/checkin/:id", [validateObjectId, auth()], checkinStructure(false));
router.put(
  "/force/checkin/:id",
  [validateObjectId, auth(), allowRoles("admin")],
  checkinStructure(true)
);
router.post("/", [auth(), allowRoles("standard")], createStructure);
router.put(
  "/:id",
  [
    validateObjectId,
    auth(),
    allowRoles("standard"),
    createSafeUpdateObject("structure"),
  ],
  updateStructure
);
router.delete(
  "/:id",
  [validateObjectId, auth(), allowRoles("admin")],
  deleteStructure
);

module.exports = router;
