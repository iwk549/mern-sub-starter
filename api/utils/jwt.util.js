const jwt = require("jsonwebtoken");

const { createUserSession } = require("./session.util");
const { User } = require("../models/user.model");

function decodeJwt(token) {
  return jwt.verify(token, process.env.JWT_KEY);
}

async function createAndSendJwt(res, next, user, userId) {
  let thisUser = user;
  if (userId) thisUser = await User.findById(userId);

  try {
    const sessionId = await createUserSession(thisUser);
    const token = thisUser.generateAuthToken(sessionId);

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .json("Success");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  decodeJwt,
  createAndSendJwt,
};
