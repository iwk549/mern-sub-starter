const request = require("supertest");

const { decodeJwt } = require("../../utils/jwt.util");
const {
  clearDb,
  clearRedis,
  testResponse,
  shutdownServer,
  insertUser,
  authHeader,
  testAuth,
} = require("../testHelpers");
const {
  getUserSession,
  deleteUserSession,
} = require("../../utils/session.util");

let server;
const endpoint = "/api/v1/auth";

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
    await clearRedis();
  });

  describe("POST /", () => {
    const exec = async (loginBody) =>
      request(server).post(endpoint).send(loginBody);

    it("should return 400 if email is not sent or empty", async () => {
      const res = await exec();
      expect(res.status).toBe(400);
      testResponse(res, 400, "email is required");
    });
    it("should return 400 if user account is not found", async () => {
      const res = await exec({ email: "test" });
      testResponse(res, 400, "invalid login credentials");
    });
    it("should return 400 if password is empty", async () => {
      const { account } = await insertUser();
      const res = await exec({ email: account.email });
      testResponse(res, 400, "invalid login credentials");
    });
    it("should return 400 if password does not match", async () => {
      const { account } = await insertUser();
      const res = await exec({
        email: account.email,
        password: "not the right password",
      });
      testResponse(res, 400, "invalid login credentials");
    });
    it("should return 300 if user already has a session open", async () => {
      const { account, plainTextPassword } = await insertUser(true);
      const res = await exec({
        email: account.email,
        password: plainTextPassword,
      });
      testResponse(res, 300, "session in progress");
    });
    it("should overwrite the existing session", async () => {
      const { user, account, plainTextPassword, sessionId } =
        await insertUser();
      const res = await exec({
        email: account.email,
        password: plainTextPassword,
        overwriteSession: true,
      });
      testResponse(res, 200, "success");
      const updatedSessionId = await getUserSession(user);
      expect(updatedSessionId).not.toBe(sessionId);
    });
    it("should return an auth token in the headers if passwords match", async () => {
      const { account, plainTextPassword } = await insertUser(false);
      const res = await exec({
        email: account.email,
        password: plainTextPassword,
      });
      testResponse(res, 200, "success");
      const decoded = decodeJwt(res.header[authHeader]);
      expect(decoded).toMatchObject({
        name: account.name,
        email: account.email,
        sessionId: expect.any(String),
      });
    });
  });

  describe("POST /logout", () => {
    const exec = async (token) =>
      request(server)
        .post(endpoint + "/logout")
        .set(authHeader, token);

    testAuth(exec, null, true);
    it("should return 200 if the user session is not found", async () => {
      const { token } = await insertUser(false);
      const res = await exec(token);
      testResponse(res, 200, "session deleted");
    });
    it("should return 200 if the user session is deleted", async () => {
      const { user, token } = await insertUser(true);
      deleteUserSession(user);
      const res = await exec(token);
      testResponse(res, 200, "session deleted");
    });
  });
});
