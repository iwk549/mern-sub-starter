const express = require("express");
const router = express.Router();
const cors = require("cors");

const errorHandler = require("../middleware/errorHandler.mw");

const v1_authRouter = require("../routes/v1/v1.auth.route");
const v1_userRouter = require("../routes/v1/v1.user.routes");

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

router.use("/healthz", async (req, res) => {
  res.json("Healthy");
});

router.use("/api/v1/auth", v1_authRouter);
router.use("/api/v1/user", v1_userRouter);

router.use(errorHandler);

module.exports = router;
