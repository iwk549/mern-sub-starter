const { decodeJwt } = require("../utils/jwt.util");
const { User, roles } = require("../models/user.model");
const { getUserSession } = require("../utils/session.util");
const { Organization } = require("../models/organization.model");
const { roleHierarchy } = require("../models/user.model");
const { deletedSchema } = require("../utils/schema.util");

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
      const user = await User.findOne({
        _id: decoded._id,
        ...deletedSchema.filterOut,
      })
        .populate({
          path: "accountId",
          populate: "authId",
        })
        .lean();
      if (!user)
        return next({ status: 409, message: "Your account was not found" });
      const session = await getUserSession(user);
      if (!logout && session !== decoded.sessionId)
        return next({
          status: 409,
          message: "Your session is no longer active. Please log in again.",
        });
      req.user = user;
    } catch (ex) {
      return next({ status: 409, message: "Invalid token" });
    }
    next();
  };
}

function allowRoles(minRole) {
  return (req, res, next) => {
    if (!req.user) return next({ status: 409, message: "User token required" });
    if (roles.includes(minRole) && roles.includes(req.user.role)) {
      for (let i = 0; i < roleHierarchy.length; i++) {
        if (roleHierarchy[i].name === req.user.role) {
          return next();
        }
        if (roleHierarchy[i].name === minRole) {
          return next({ status: 403, message: "Insufficient permissions" });
        }
      }
    }

    next({ status: 400, message: "Invalid user role" });
  };
}

function findOrg(mustBeOwner) {
  return async (req, res, next) => {
    if (!req.user) return next({ status: 409, message: "User token required" });

    const filter = {
      _id: req.user.organizationId,
      ...deletedSchema.filterOut,
    };
    if (mustBeOwner) filter.ownerId = req.user._id;
    const org = await Organization.findOne(filter);
    if (!org) return next({ status: 404, message: "Organization not found" });

    req.org = org;
    next();
  };
}

module.exports = { auth, allowRoles, findOrg };
