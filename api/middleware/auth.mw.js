const { decodeJwt } = require("../utils/jwt.util");
const { User } = require("../models/user.model");
const { getUserSession } = require("../utils/session.util");

function auth(logout = false) {
  return async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token)
      return next({
        status: 401,
        message: "Access denied. No token provided.",
      });
    try {
      const decoded = decodeJwt(token);
      const user = await User.findById(decoded._id);
      if (!user)
        return next({ status: 409, message: "Your account was not found" });
      const session = await getUserSession(user);
      if (!logout && session !== decoded.sessionId)
        return next({
          status: 409,
          message: "Your session is no longer active. Please log in again.",
        });
      req.user = user;
      next();
    } catch (ex) {
      return next({ status: 409, message: "Invalid token" });
    }
  };
}

module.exports = auth;
