const request = require("supertest");

const { decodeJwt } = require("../../utils/jwt.util");
const { users } = require("../testData");
const {
  clearDb,
  testResponse,
  shutdownServer,
  authHeader,
  testAuth,
  insertUser,
} = require("../testHelpers");
const { User } = require("../../models/user.model");

let server;
const endpoint = "/api/v1/user";

describe("v1.auth.route", () => {
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

  describe("User Route", () => {
    describe("POST /", () => {
      const exec = async (loginBody) =>
        request(server).post(endpoint).send(loginBody);

      it("should return 400 if email is not sent or empty", async () => {
        const res = await exec();
        expect(res.status).toBe(400);
        testResponse(res, 400, "email is required");
      });
      it("should return 400 if user body is not valid", async () => {
        const res = await exec({ email: "test1", invalidField: "xxx" });
        testResponse(res, 400, "is required");
      });
      it("should return 400 if the email address already has an account", async () => {
        const { user } = await insertUser();
        const res = await exec({
          ...users[0],
          password: "Password1",
          email: user.email,
        });
        testResponse(res, 400, "already registered");
      });
      it("should register the new user and provide a login token", async () => {
        const res = await exec({ ...users[0], password: "Password1" });
        testResponse(res, 200, "success");
        const decoded = decodeJwt(res.header[authHeader]);
        expect(decoded).toMatchObject(users[0]);
        const savedUser = await User.findOne({ email: users[0].email });
        expect(savedUser).toMatchObject(users[0]);
      });
    });

    describe("GET /", () => {
      const exec = async (token) =>
        request(server).get(endpoint).set(authHeader, token);

      testAuth(exec);
      it("should send back the updated user information", async () => {
        const { user, sessionId } = await insertUser();
        const token = user.generateAuthToken(sessionId);
        user.name = "Update Name";
        await user.save();
        const res = await exec(token);
        testResponse(res, 200);
        const decoded = decodeJwt(res.header[authHeader]);
        expect(decoded).not.toMatchObject(user);
        expect(decoded).toMatchObject({
          name: "Update Name",
          email: user.email,
        });
      });
    });

    describe("DELETE /", () => {
      const exec = async (token) =>
        request(server).delete(endpoint).set(authHeader, token);

      testAuth(exec);
      it("should delete the user and auth", async () => {
        const { user, sessionId } = await insertUser();
        const token = user.generateAuthToken(sessionId);
        const res = await exec(token);
        expect(res.body.user.deletedCount).toBe(1);
        expect(res.body.auth.deletedCount).toBe(1);
        const allUsers = await User.find();
        expect(allUsers.length).toBe(0);
      });
    });

    describe("PUT /", () => {
      const exec = async (token, update) =>
        request(server).put(endpoint).set(authHeader, token).send(update);

      testAuth(exec);
      it("should return 400 if body is not valid", async () => {
        const { user, sessionId } = await insertUser();
        const token = user.generateAuthToken(sessionId);
        const res = await exec(token);
        testResponse(res, 400, "required");
      });
      it("should only update allowed fields", async () => {
        const { user, sessionId } = await insertUser();
        const token = user.generateAuthToken(sessionId);
        const res = await exec(token, {
          ...users[0],
          name: "Updated Name",
          email: "update@update.com",
          role: "admin",
        });
        testResponse(res, 200);

        // name should update, email should not
        const updatedUser = await User.findById(user._id);
        expect(updatedUser.name).toBe("Updated Name");
        expect(updatedUser.email).toBe(user.email);
      });
    });
  });
});
