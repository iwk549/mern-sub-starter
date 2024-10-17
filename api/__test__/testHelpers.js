const mongoose = require("mongoose");
const redisClient = require("../startup/redisClient.startup");

const {
  user: testUser,
  account: testAccount,
  authId,
  accountId,
  organization: testOrg,
  invitation: testInvitation,
  project: testProject,
  structure: testStructure,
} = require("./testData");

const { Auth } = require("../models/auth.model");
const { User, roleHierarchy } = require("../models/user.model");
const { saltAndHashPassword } = require("../utils/encryption.util");
const { createUserSession } = require("../utils/session.util");
const { Account } = require("../models/account.model");
const { Organization } = require("../models/organization.model");
const { Project } = require("../models/project.model");
const { Structure } = require("../models/structure.model");
const { Invitation } = require("../models/invitation.model");

async function clearDb() {
  await Auth.collection.deleteMany({});
  await User.collection.deleteMany({});
  await Invitation.collection.deleteMany({});
  await Account.collection.deleteMany({});
  await Organization.collection.deleteMany({});
  await Project.collection.deleteMany({});
  await Structure.collection.deleteMany({});
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

function testAuth(exec, minRole, isLogout, validateObjectId) {
  describe("Auth & Middleware", () => {
    const oId = validateObjectId ? new mongoose.Types.ObjectId() : null;
    if (validateObjectId)
      it("should return 400 if object id is not valid", async () => {
        const res = await exec("", "xxx");
        testResponse(res, 400, "invalid id");
      });
    it("should return 401 if no token provided", async () => {
      const res = await exec("", oId);
      testResponse(res, 401, "no token provided");
    });
    it("should return 409 if invalid token is provided", async () => {
      const res = await exec("xxx", oId);
      testResponse(res, 409, "invalid token");
    });
    it("should return 409 if the user is not found (or is marked deleted)", async () => {
      const { user, token: tokenNotFound } = await insertUser(true);
      const { token: tokenDeleted } = await insertUser(
        true,
        { deleted: new Date() },
        {},
        {},
        true
      );
      await User.collection.deleteOne({ _id: user._id });

      // marked deleted
      const res1 = await exec(tokenDeleted, oId);
      // not found
      const res2 = await exec(tokenNotFound, oId);

      testResponse(res1, 409, "not found");
      testResponse(res2, 409, "not found");
    });
    if (minRole) {
      it(`should return 403 if user does not have at least ${minRole} role`, async () => {
        const roleIndex = roleHierarchy.findIndex((h) => h.name === minRole);
        if (roleIndex >= 0 && roleHierarchy[roleIndex + 1]) {
          const { token } = await insertUser(true, {
            role: roleHierarchy[roleIndex + 1].name,
          });
          const res = await exec(token, oId);
          testResponse(res, 403, "permissions");
        } else {
          throw new Error("Lower role does not exist");
        }
      });
    }
    if (!isLogout)
      it("should return 409 if the session does not match", async () => {
        const { user } = await insertUser();
        const token = user.generateAuthToken(1234);
        const res = await exec(token, oId);
        testResponse(res, 409, "session is no longer active");
      });
  });
}

function testOrgExists(exec, validateObjectId) {
  const oId = validateObjectId ? new mongoose.Types.ObjectId() : null;
  it("should return 404 if org does not exist", async () => {
    const { token } = await insertUser(true, { role: "owner" });
    const res = await exec(token, oId);
    testResponse(res, 404, "organization not found");
  });
  it("should return 404 if the org is deleted", async () => {
    await insertOrg({ deleted: new Date() });
    const { token } = await insertUser(true, { role: "owner" });
    const res = await exec(token, oId);
    testResponse(res, 404, "not found");
  });
}

function testResponse(res, status, text) {
  expect(res.status).toBe(status);
  if (text)
    expect(res.text.toLowerCase()).toEqual(
      expect.stringContaining(text.toLowerCase())
    );
}

function testNextCall(nextFn, status, message) {
  expect(nextFn).toHaveBeenCalledTimes(1);
  if (status)
    expect(nextFn).toHaveBeenCalledWith({
      status,
      message: expect.any(String),
    });
  if (message) {
    const call = nextFn.mock.calls[0][0];
    expect(call.message.toLowerCase()).toEqual(
      expect.stringContaining(message.toLowerCase())
    );
  }
}

async function insertUser(
  loggedIn = true,
  userOverride = {},
  authOverride = {},
  accountOverride = {},
  existingAccount
) {
  let plainTextPassword, auth, account;
  if (!existingAccount) {
    plainTextPassword = authOverride.password || "Password1";
    delete authOverride.password;
    const password = await saltAndHashPassword(plainTextPassword);
    auth = new Auth({
      _id: authId,
      password,
      loginCode: null,
      ...authOverride,
    });
    await auth.save();
    account = new Account({
      _id: accountId,
      authId,
      ...testAccount,
      ...accountOverride,
    });
    await account.save();
  }

  const user = new User({
    accountId,
    ...testUser,
    ...userOverride,
  });
  await user.save();
  let sessionId;
  if (loggedIn) sessionId = await createUserSession(user);
  const token = user.generateAuthToken(sessionId);

  return { user, auth, account, plainTextPassword, sessionId, token };
}

async function insertOrg(orgOverride = {}) {
  const org = new Organization({
    ...testOrg,
    ...orgOverride,
  });

  await org.save();

  return org;
}

async function insertInvitation(invitationOverride = {}) {
  const invitation = new Invitation({
    ...testInvitation,
    ...invitationOverride,
  });

  await invitation.save();

  return invitation;
}

async function insertProject(projectOverride) {
  const project = new Project({
    ...testProject,
    ...projectOverride,
  });

  await project.save();

  return project;
}

async function insertStructure(structureOverride) {
  const structure = new Structure({
    ...testStructure,
    ...structureOverride,
  });
  await structure.save();
  return structure;
}

module.exports = {
  clearDb,
  clearRedis,
  shutdownServer,
  testAuth,
  testOrgExists,
  testResponse,
  testNextCall,
  insertUser,
  insertOrg,
  insertInvitation,
  insertProject,
  insertStructure,
  authHeader: "x-auth-token",
};
