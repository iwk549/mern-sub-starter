const request = require("supertest");

const { decodeJwt } = require("../../utils/jwt.util");
const {
  organization,
  account: testAccount,
  organizationId,
} = require("../testData");
const {
  clearDb,
  testResponse,
  shutdownServer,
  authHeader,
  testAuth,
  insertUser,
  insertOrg,
  insertProject,
  insertStructure,
  testOrgExists,
} = require("../testHelpers");
const { genericLoginError } = require("../../utils/user.util");
const { Account } = require("../../models/account.model");
const { User } = require("../../models/user.model");
const { Auth } = require("../../models/auth.model");
const { default: mongoose } = require("mongoose");
const { Organization } = require("../../models/organization.model");
const { Project } = require("../../models/project.model");
const { Structure } = require("../../models/structure.model");
const { deletedSchema } = require("../../utils/schema.util");

let server;
const endpoint = "/api/v1/organization";

describe("v1.organization.route", () => {
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

    it("should return 400 if org name is in use", async () => {
      const org = await insertOrg();
      const res = await exec(
        {
          name: org.name,
        },
        {
          name: testAccount.name,
          email: testAccount.email,
          password: "Password1!",
        }
      );
      testResponse(res, 400, "in use");
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

  describe("PUT /", () => {
    const exec = async (token, org) =>
      request(server).put(endpoint).send(org).set(authHeader, token);

    testAuth(exec, "owner");
    testOrgExists(exec);
    it("should return 400 if update is invalid", async () => {
      const { user, token } = await insertUser(true, {
        role: "owner",
      });
      await insertOrg({ ownerId: user._id });
      const res = await exec(token);
      testResponse(res, 400, "required");
    });
    it("should update only the allowed values", async () => {
      const { user, token } = await insertUser(true, {
        role: "owner",
      });
      const org = await insertOrg({ ownerId: user._id });
      const res = await exec(token, {
        ownerId: new mongoose.Types.ObjectId(),
        name: "New Name",
      });
      testResponse(res, 200);

      const updatedOrg = await Organization.findOne();
      expect(updatedOrg).toMatchObject({
        name: "New Name",
        ownerId: org.ownerId,
      });
    });
  });

  describe("DELETE /", () => {
    const exec = async (token) =>
      request(server).delete(endpoint).set(authHeader, token);

    testAuth(exec, "owner");
    it("should mark all collections related to org for deletion", async () => {
      const aid1 = new mongoose.Types.ObjectId();
      const aid2 = new mongoose.Types.ObjectId();
      const aid3 = new mongoose.Types.ObjectId();

      // owner account with 2 users
      const { user, account, token } = await insertUser(true, {
        role: "owner",
      });
      await insertUser(
        false,
        {
          accountId: account._id,
          organizationId: new mongoose.Types.ObjectId(),
        },
        {},
        {},
        true
      );

      // another account with 2 users
      await insertUser(
        false,
        {
          accountId: aid1,
        },
        { _id: new mongoose.Types.ObjectId() },
        { _id: aid1, email: "newemail" }
      );
      await insertUser(
        false,
        { accountId: aid1, organizationId: new mongoose.Types.ObjectId() },
        {},
        {},
        true
      );

      // two accounts with a single user
      await insertUser(
        false,
        {
          accountId: aid2,
        },
        { _id: new mongoose.Types.ObjectId() },
        { _id: aid2, email: "newemail1" }
      );
      await insertUser(
        false,
        {
          accountId: aid3,
          organizationId: new mongoose.Types.ObjectId(),
        },
        { _id: new mongoose.Types.ObjectId() },
        { _id: aid3, email: "newemail2" }
      );

      await insertOrg({ ownerId: user._id });
      await insertProject();
      await insertProject();
      await insertProject();
      await insertProject({ organizationId: new mongoose.Types.ObjectId() });

      await insertStructure();
      await insertStructure();
      await insertStructure();
      await insertStructure({ organizationId: new mongoose.Types.ObjectId() });
      const res = await exec(token);
      testResponse(res, 200);

      const deletedOrg = await Organization.findById(user.organizationId);
      expect(deletedOrg.deleted).toEqual(expect.any(Date));

      const deletedUsers = await User.find(deletedSchema.filterFor);
      expect(deletedUsers.length).toBe(3);
      expect(
        deletedUsers.every((user) => user.organizationId === organizationId)
      );

      const deletedProjects = await Project.find(deletedSchema.filterFor);
      expect(deletedProjects.length).toBe(3);
      expect(
        deletedProjects.every(
          (project) => project.organizationId === organizationId
        )
      );

      const deletedStructures = await Structure.find(deletedSchema.filterFor);
      expect(deletedStructures.length).toBe(3);
      expect(
        deletedStructures.every(
          (structure) => structure.organizationId === organizationId
        )
      );
    });
  });

  describe("GET /", () => {
    const exec = async (token) =>
      request(server).get(endpoint).set(authHeader, token);

    testAuth(exec);
    testOrgExists(exec);
    it("should return the organization", async () => {
      const org = await insertOrg();
      const { token } = await insertUser();
      const res = await exec(token);
      testResponse(res, 200);
      expect(res.body).toMatchObject({
        name: org.name,
      });
    });
  });
});
