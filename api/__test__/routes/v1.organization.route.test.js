const request = require("supertest");

const { decodeJwt } = require("../../utils/jwt.util");
const { organization, account: testAccount } = require("../testData");
const {
  clearDb,
  testResponse,
  shutdownServer,
  authHeader,
  testAuth,
  insertUser,
} = require("../testHelpers");
const { genericLoginError } = require("../../utils/user.util");
const { Account } = require("../../models/account.model");
const { User } = require("../../models/user.model");
const { Auth } = require("../../models/auth.model");

let server;
const endpoint = "/api/v1/organization";

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
      const exec = async (orgInfo, userInfo) =>
        request(server)
          .post(endpoint)
          .send({ organization: orgInfo, user: userInfo });

      it("should return 400 if email is not provided", async () => {
        const res = await exec();
        testResponse(res, 400, "email is required");
      });
      it("should return 400 if email in use and password does not match", async () => {
        const { account, plainTextPassword } = await insertUser();
        const res = await exec(
          {},
          { email: account.email, password: plainTextPassword + "xxx" }
        );
        testResponse(res, 400, genericLoginError.message);
      });
      it("should return 400 if org is not valid", async () => {
        const res = await exec({}, { email: "test@test.com" });
        testResponse(res, 400, "is required");
      });
      it("should return 400 if password is not valid", async () => {
        const res = await exec(
          { name: organization.name },
          {
            name: "Test",
            email: "test@test.com",
            password: "short",
          }
        );
        testResponse(res, 400, "password should be");
      });
      it("should return 400 if user info is not valid", async () => {
        const res = await exec(
          { name: organization.name },
          {
            email: "test@test.com",
            password: "Password1!",
          }
        );
        testResponse(res, 400, "is required");
      });
      it("should create a new account and new org", async () => {
        const res = await exec(
          {
            name: organization.name,
          },
          {
            name: testAccount.name,
            email: testAccount.email,
            password: "Password1!",
          }
        );
        testResponse(res, 200);
        const decoded = decodeJwt(res.header[authHeader]);
        expect(decoded).toMatchObject({
          name: testAccount.name,
          email: testAccount.email,
          role: "owner",
          sessionId: expect.any(String),
        });

        const user = await User.findOne();
        const account = await Account.findOne();
        const auth = await Auth.findOne();
        expect(user).not.toBeNull();
        expect(account).not.toBeNull();
        expect(auth).not.toBeNull();
      });
      it("should create a new org on an existing account", async () => {
        const { plainTextPassword, account } = await insertUser();
        const res = await exec(
          {
            name: organization.name,
          },
          {
            name: account.name,
            email: account.email,
            password: plainTextPassword,
          }
        );
        testResponse(res, 200);
        const decoded = decodeJwt(res.header[authHeader]);
        expect(decoded).toMatchObject({
          name: testAccount.name,
          email: testAccount.email,
          role: "owner",
          sessionId: expect.any(String),
        });
        const users = await User.find();
        const dbAccounts = await Account.find();
        const auths = await Auth.find();
        expect(users.length).toBe(2);
        expect(dbAccounts.length).toBe(1);
        expect(auths.length).toBe(1);
        users.forEach((user) => {
          expect(user.accountId).toEqual(dbAccounts[0]._id);
        });
        expect(dbAccounts[0].authId).toEqual(auths[0]._id);
      });
    });
  });
});
