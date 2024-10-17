const request = require("supertest");

const {
  clearDb,
  clearRedis,
  testResponse,
  shutdownServer,
  insertUser,
  authHeader,
  testAuth,
  insertInvitation,
  insertOrg,
} = require("../testHelpers");
const { organizationId } = require("../testData");
const mongoose = require("mongoose");
const { Invitation } = require("../../models/invitation.model");

let server;
const endpoint = "/api/v1/invitation";

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

  describe("GET /", () => {
    const exec = async (token) =>
      request(server).get(endpoint).set(authHeader, token);

    testAuth(exec, "admin");
    it("should return all invitations for the org just the email", async () => {
      await insertInvitation();
      await insertInvitation();
      await insertInvitation({ organizationId: new mongoose.Types.ObjectId() });
      const { token } = await insertUser();
      await insertOrg();
      const res = await exec(token);
      testResponse(res, 200);
      expect(res.body.length).toBe(2);
      expect(res.body.every((inv) => !inv.code && !inv.organizationId)).toBe(
        true
      );
    });
  });

  describe("POST /", () => {
    const exec = async (token, userInfo) =>
      request(server).post(endpoint).set(authHeader, token).send(userInfo);

    testAuth(exec, "admin");
    it("should return 400 if email is not sent", async () => {
      await insertOrg();
      const { token } = await insertUser();
      const res = await exec(token);
      testResponse(res, 400, "email is required");
    });
    it("should return 400 if email already has account with org", async () => {
      await insertOrg();
      const { token } = await insertUser();
      await insertUser(
        false,
        {
          organizationId,
          email: "testinvited@test.com",
        },
        {},
        { _id: new mongoose.Types.ObjectId() },
        {
          _id: new mongoose.Types.ObjectId(),
        }
      );
      const res = await exec(token, { email: "testinvited@test.com" });
      testResponse(res, 400, "already a user in your org");
    });
    it("should create an invitation and send the email", async () => {
      await insertOrg();
      const { token } = await insertUser();
      const res = await exec(token, { email: "test@test.com" });
      testResponse(res, 200);
      const invitation = await Invitation.findOne().lean();
      expect(invitation).toMatchObject({
        email: "test@test.com",
        organizationId: organizationId,
        code: expect.any(String),
      });
    });
  });

  describe("DELETE /:email", () => {
    const exec = async (token, email) =>
      request(server)
        .delete(endpoint + "/" + email)
        .set(authHeader, token);

    testAuth(exec, "admin");
    it("should return 404 if invitation is not found", async () => {
      const { token } = await insertUser();
      await insertOrg();
      const res = await exec(token, "test1@test.com");
      testResponse(res, 404, "invitation not found");
    });
    it("should delete the invitation", async () => {
      const { token } = await insertUser();
      await insertOrg();
      const invitation = await insertInvitation();
      const res = await exec(token, invitation.email);
      testResponse(res, 200);
    });
  });
});
