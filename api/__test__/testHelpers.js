const mongoose = require("mongoose");
const redisClient = require("../startup/redisClient.startup");

const { users } = require("./testData");

const { Auth } = require("../models/auth.model");
const { User } = require("../models/user.model");
const { saltAndHashPassword } = require("../utils/encryption.util");
const { createUserSession } = require("../utils/session.util");

async function clearDb() {
  await Auth.collection.deleteMany();
  await User.collection.deleteMany();
}

async function clearRedis() {
  for await (const key of redisClient.scanIterator({
    MATCH: "*",
  })) {
    await redisClient.del(key);
  }
}

async function shutdownServer(server) {
  try {
    await server.close();
  } catch (error) {}
  mongoose.connection.close();
  try {
    redisClient.disconnect();
  } catch (error) {}
}

function testAuth(exec, isLogout) {
  it("should return 401 if no token provided", async () => {
    const res = await exec("");
    testResponse(res, 401, "no token provided");
  });
  it("should return 409 if invalid token is provided", async () => {
    const res = await exec("xxx");
    testResponse(res, 409, "invalid token");
  });
  it("should return 409 if the user is not found", async () => {
    const { user } = await insertUser();
    const token = user.generateAuthToken();
    await User.collection.deleteMany();
    const res = await exec(token);
    testResponse(res, 409, "not found");
  });
  if (!isLogout)
    it("should return 409 if the session does not match", async () => {
      const { user } = await insertUser();
      const token = user.generateAuthToken(1234);
      const res = await exec(token);
      testResponse(res, 409, "session is no longer active");
    });
}

function testResponse(res, status, text) {
  expect(res.status).toBe(status);
  if (text)
    expect(res.text.toLowerCase()).toEqual(
      expect.stringContaining(text.toLowerCase())
    );
}

async function insertUser(
  loggedIn = true,
  authOverride = {},
  userOverride = {}
) {
  const plainTextPassword = authOverride.password || "Password1";
  delete authOverride.password;
  const password = await saltAndHashPassword(plainTextPassword);
  const auth = new Auth({
    password,
    loginCode: null,
    ...authOverride,
  });
  await auth.save();
  const user = new User({
    authId: auth._id,
    ...users[0],
    ...userOverride,
  });
  await user.save();

  let sessionId;
  if (loggedIn) sessionId = await createUserSession(user);

  return { user, auth, plainTextPassword, sessionId };
}

module.exports = {
  clearDb,
  clearRedis,
  shutdownServer,
  testAuth,
  testResponse,
  insertUser,
  authHeader: "x-auth-token",
};
