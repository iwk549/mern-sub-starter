const { Account } = require("../../models/account.model");
const { User } = require("../../models/user.model");
const { comparePassword } = require("../../utils/encryption.util");
const { createAndSendJwt } = require("../../utils/jwt.util");
const {
  getUserSession,
  deleteUserSession,
} = require("../../utils/session.util");
const { genericLoginError } = require("../../utils/user.util");

async function login(req, res, next) {
  const user = await User.findOne({ email: req.body.email }).populate({
    path: "accountId",
    populate: "authId",
  });

  const loginValid = await comparePassword(user?.accountId, req.body.password);
  if (!loginValid) return next(genericLoginError);

  const existingSessionId = await getUserSession(user);
  if (existingSessionId && !req.body.overwriteSession)
    return next({
      status: 300,
      message: "Session in progress, decide how to proceed.",
    });

  createAndSendJwt(res, next, user);
}

async function logout(req, res) {
  await deleteUserSession(req.user);
  res.json("Session deleted");
}

module.exports = {
  login,
  logout,
};
