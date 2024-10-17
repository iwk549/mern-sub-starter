const request = require("supertest");

const { decodeJwt } = require("../../utils/jwt.util");
const { user: testUser, authId, accountId } = require("../testData");
const {
  clearDb,
  testResponse,
  shutdownServer,
  authHeader,
  testAuth,
  insertUser,
} = require("../testHelpers");
const { User } = require("../../models/user.model");
const { Auth } = require("../../models/auth.model");
const { Account } = require("../../models/account.model");

let server;
const endpoint = "/api/v1/user";

describe("v1.user.route", () => {
  beforeAll(() => {
    if (process.env.NODE_ENV === "test") server = require("../../index");
    else throw "Not in test environment";
  });
  afterAll(async () => {
    await shutdownServer(server);
  });

  afterEach(async () => {
    await clearDb();
  });

  describe("GET /", () => {
    const exec = async (token) =>
      request(server).get(endpoint).set(authHeader, token);

    testAuth(exec);
    it("should send back the updated user information", async () => {
      const { user, account, token } = await insertUser();
      account.name = "Update Name";
      await account.save();
      const res = await exec(token);
      testResponse(res, 200);
      const decoded = decodeJwt(res.header[authHeader]);
      expect(decoded).not.toMatchObject(user);
      expect(decoded).toMatchObject({
        name: "Update Name",
        email: account.email,
      });
    });
  });

  describe("GET /accounts", () => {
    const exec = async (token) =>
      request(server)
        .get(endpoint + "/accounts")
        .set(authHeader, token);

    testAuth(exec);
    it("should return the only user", async () => {
      const { token } = await insertUser();
      const res = await exec(token);
      testResponse(res, 200);
      expect(res.body.length).toBe(1);
    });
    it("should return all users under the account", async () => {
      const { token } = await insertUser();
      const res = await exec(token);
      testResponse(res, 200);
      expect(res.body.length).toBe(1);
    });
  });

  describe("DELETE /", () => {
    const exec = async (token) =>
      request(server).delete(endpoint).set(authHeader, token);

    testAuth(exec);
    it("should delete the user only if there are remaining accounts", async () => {
      const { user, token } = await insertUser();
      await insertUser(false, {}, {}, {}, true);

      const res = await exec(token);

      expect(res.body.user.deletedCount).toBe(1);
      const deletedUser = await User.findById(user._id);
      const auth = await Auth.findById(authId);
      const account = await Account.findById(accountId);
      expect(deletedUser).toBeNull();
      expect(auth).not.toBeNull();
      expect(account).not.toBeNull();
    });
    it("should delete the user, auth, and account if this is the last user", async () => {
      const { user, token } = await insertUser();
      const res = await exec(token);

      expect(res.body.user.deletedCount).toBe(1);
      expect(res.body.auth.deletedCount).toBe(1);
      expect(res.body.account.deletedCount).toBe(1);
      const deletedUser = await User.findById(user._id);
      const deletedAuth = await Auth.findById(authId);
      const deletedAccount = await Account.findById(accountId);
      expect(deletedUser).toBeNull();
      expect(deletedAuth).toBeNull();
      expect(deletedAccount).toBeNull();
    });
  });

  describe("PUT /", () => {
    const exec = async (token, update) =>
      request(server).put(endpoint).set(authHeader, token).send(update);

    testAuth(exec);
    it("should return 400 if body is not valid", async () => {
      const { token } = await insertUser();
      const res = await exec(token);
      testResponse(res, 400, "required");
    });
    it("should only update allowed fields", async () => {
      const { user, token, account } = await insertUser();
      const res = await exec(token, {
        ...testUser,
        name: "Updated Name",
        email: "update@update.com",
        role: "admin",
      });
      testResponse(res, 200);

      // name should update, email should not
      const updatedUser = await User.findById(user._id).populate("accountId");
      expect(updatedUser.accountId.name).toBe("Updated Name");
      expect(updatedUser.name).toBe("Updated Name");
      expect(updatedUser.accountId.email).toBe(account.email);
      expect(updatedUser.email).toBe(account.email);
    });
  });
});
