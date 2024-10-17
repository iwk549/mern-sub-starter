const logger = require("../startup/logging.startup")();

module.exports = function (err, _req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  // if (status === 500) console.error("Error1:", message);

  return res.status(status).json(message);
};
