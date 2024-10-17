const express = require("express");
const router = express.Router();
const cors = require("cors");

const errorHandler = require("../middleware/errorHandler.mw");

const v1_authRouter = require("../routes/v1/v1.auth.route");
const v1_userRouter = require("../routes/v1/v1.user.routes");
const v1_organizationRouter = require("../routes/v1/v1.organization.route");
const v1_projectRouter = require("../routes/v1/v1.project.route");
const v1_structureRouter = require("../routes/v1/v1.structure.route");
const v1_invitationRouter = require("../routes/v1/v1.invitation.route");
const { generalLimiter } = require("../middleware/rateLimiter.mw");

const uploadLimit = "5mb";

router.use(cors());
router.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
    limit: uploadLimit,
  })
);
router.use(express.urlencoded({ extended: true, limit: uploadLimit }));
router.use(express.static("public"));
router.use(generalLimiter);

router.use("/healthz", async (req, res) => {
  res.json("Healthy");
});

router.use("/api/v1/auth", v1_authRouter);
router.use("/api/v1/user", v1_userRouter);
router.use("/api/v1/organization", v1_organizationRouter);
router.use("/api/v1/project", v1_projectRouter);
router.use("/api/v1/module", v1_structureRouter);
router.use("/api/v1/invitation", v1_invitationRouter);

router.use(errorHandler);

module.exports = router;
