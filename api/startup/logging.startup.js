const morgan = require("morgan");

module.exports = function () {
  const type = process.env.NODE_ENV === "production" ? "combined" : "dev";
  return morgan(type);
};
