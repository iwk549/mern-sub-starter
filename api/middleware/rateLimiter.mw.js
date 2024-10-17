const rateLimit = require("express-rate-limit");

const maxForCypressRequests = 100_000;
const tooManyAttemptsMessage =
  "Too many failed login attempts. Please wait one minute and try again.";

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max:
    process.env.NODE_ENV === "cypress" || process.env.NODE_ENV === "test"
      ? maxForCypressRequests
      : 50, // number of requests allowed in timeframe
  statusCode: 429,
  message: tooManyAttemptsMessage,
  handler: function (req, res) {
    res.status(429).json(tooManyAttemptsMessage);
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:
    process.env.NODE_ENV === "cypress" || process.env.NODE_ENV === "test"
      ? maxForCypressRequests
      : 500, // number of requests allowed in timeframe
  statusCode: 429,
  message: tooManyAttemptsMessage,
  handler: function (req, res) {
    res.status(429).json(tooManyAttemptsMessage);
  },
});

module.exports = {
  loginLimiter,
  generalLimiter,
};
