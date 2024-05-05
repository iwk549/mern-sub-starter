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
  createUserSession,
  getUserSession,
} = require("../../utils/session.util");

let server;
const endpoint = "/api/v1/auth";

describe("v1.auth.route", () => {
  beforeAll(() => {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === "test") server = require("../../index");
    else throw "Not in test environment";
  });
  afterAll(async () => {
    await shutdownServer(server);
  });

  afterEach(async () => {
    await clearDb();
    await clearRedis;
  });

  describe("Auth Route", () => {
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
        const { user } = await insertUser();
        const res = await exec({ email: user.email });
        testResponse(res, 400, "invalid login credentials");
      });
      it("should return 400 if password does not match", async () => {
        const { user } = await insertUser();
        const res = await exec({
          email: user.email,
          password: "not the right password",
        });
        testResponse(res, 400, "invalid login credentials");
      });
      it("should return 300 if user already has a session open", async () => {
        const { user, plainTextPassword } = await insertUser();
        await createUserSession(user);
        const res = await exec({
          email: user.email,
          password: plainTextPassword,
        });
        testResponse(res, 300, "session in progress");
      });
      it("should overwrite the existing session", async () => {
        const { user, plainTextPassword, sessionId } = await insertUser();
        const res = await exec({
          email: user.email,
          password: plainTextPassword,
          overwriteSession: true,
        });
        testResponse(res, 200, "success");
        const updatedSessionId = await getUserSession(user);
        expect(updatedSessionId).not.toBe(sessionId);
      });
      it("should return an auth token in the headers if passwords match", async () => {
        const { user, plainTextPassword } = await insertUser(false);
        const res = await exec({
          email: user.email,
          password: plainTextPassword,
        });
        testResponse(res, 200, "success");
        const decoded = decodeJwt(res.header[authHeader]);
        expect(decoded).toMatchObject({
          name: user.name,
          email: user.email,
          sessionId: expect.any(String),
        });
      });
    });
  });

  describe("POST /logout", () => {
    const exec = async (token) =>
      request(server)
        .post(endpoint + "/logout")
        .set(authHeader, token);

    testAuth(exec, true);
    it("should return 200 if the user session is not found", async () => {
      const { user } = await insertUser(false);
      const res = await exec(user.generateAuthToken(1234));
      testResponse(res, 200, "session deleted");
    });
    it("should return 200 if the user session is deleted", async () => {
      const { user } = await insertUser(true);
      const res = await exec(user.generateAuthToken(1234));
      testResponse(res, 200, "session deleted");
    });
  });
});
