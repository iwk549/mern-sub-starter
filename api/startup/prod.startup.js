const router = require("express").Router;
const helmet = require("helmet");
const compression = require("compression");

router.use(helmet());
router.use(compression());

module.exports = router;
