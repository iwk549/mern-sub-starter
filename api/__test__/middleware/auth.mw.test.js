const request = require("supertest");

const { auth, allowRoles, findOrg } = require("../../middleware/auth.mw");
const {
  clearDb,
  clearRedis,
  shutdownServer,
  insertUser,
  testNextCall,
  insertOrg,
} = require("../testHelpers");
const { User, roleHierarchy } = require("../../models/user.model");
const mongoose = require("mongoose");

let server;
let next;

describe("auth.mw", () => {
  beforeAll(() => {
    if (process.env.NODE_ENV === "test") server = require("../../index");
    else throw "Not in test environment";
  });
  afterAll(async () => {
    await shutdownServer(server);
  });

  beforeEach(() => {
    next = jest.fn();
  });
  afterEach(async () => {
    jest.resetAllMocks();
    await clearDb();
    await clearRedis();
  });

  describe("auth", () => {
    it("should return 401 if no token sent", async () => {
      await auth(false)({ header: () => {} }, {}, next);
      testNextCall(next, 401, "no token provided");
    });
    it("should return 409 if token cannot be decoded", async () => {
      await auth(false)(
        {
          header: () => "1234",
        },
        {},
        next
      );
      testNextCall(next, 409, "invalid token");
    });
    it("should return 409 if account is not found", async () => {
      const { token } = await insertUser(true);
      await User.deleteMany();
      await auth(false)(
        {
          header: () => token,
        },
        {},
        next
      );
      testNextCall(next, 409, "account was not found");
    });
    it("should return 409 if session does not match and not logging out", async () => {
      const { token } = await insertUser(false);
      await auth(false)(
        {
          header: () => token,
        },
        {},
        next
      );
      testNextCall(next, 409, "session is no longer active");
    });
    it("should add the user to the request when logging out", async () => {
      const { token, user, account } = await insertUser(false);
      const req = {
        header: () => token,
      };
      await auth(true)(req, {}, next);
      testNextCall(next);
      expect(req.user).toMatchObject({
        role: user.role,
        accountId: {
          name: account.name,
          email: account.email,
        },
      });
    });
    it("should add the user to the request when not logging out", async () => {
      const { token, user, account } = await insertUser(true);
      const req = {
        header: () => token,
      };
      await auth(false)(req, {}, next);
      testNextCall(next);
      expect(req.user).toMatchObject({
        role: user.role,
        accountId: {
          name: account.name,
          email: account.email,
        },
      });
    });
  });

  describe("allowRoles", () => {
    it("should return 409 if the request does not have a user", async () => {
      await allowRoles()({}, {}, next);
      testNextCall(next, 409, "user token required");
    });
    it("should return 400 if minRole not valid", async () => {
      await allowRoles("invalid")({ user: { role: "owner" } }, {}, next);
      testNextCall(next, 400, "invalid user role");
    });
    it("should return 400 if user role not valid", async () => {
      await allowRoles("owner")({ user: { role: "invalid" } }, {}, next);
      testNextCall(next, 400, "invalid user role");
    });
    [
      {
        minRole: "owner",
        allow: ["owner"],
        disallow: ["admin", "standard", "readonly"],
      },
      {
        minRole: "admin",
        allow: ["owner", "admin"],
        disallow: ["standard", "readonly"],
      },
      {
        minRole: "standard",
        allow: ["owner", "admin", "standard"],
        disallow: ["readonly"],
      },
      {
        minRole: "readonly",
        allow: ["owner", "admin", "standard", "readonly"],
        disallow: [],
      },
    ].forEach((roleTest) => {
      describe(`minRole: ${roleTest.minRole}`, () => {
        roleTest.allow.forEach((role) => {
          it(`should allow ${role}`, async () => {
            await allowRoles(roleTest.minRole)({ user: { role } }, {}, next);
            testNextCall(next);
          });
        });
        roleTest.disallow.forEach((role) => {
          it(`should allow ${role}`, async () => {
            await allowRoles(roleTest.minRole)({ user: { role } }, {}, next);
            testNextCall(next, 403, "insufficient permissions");
          });
        });
      });
    });
  });

  describe("findOrg", () => {
    it("should return 409 if the request does not have a user", async () => {
      await findOrg()({}, {}, next);
      testNextCall(next, 409, "user token required");
    });
    it("should return 404 if org is deleted", async () => {
      const { user } = await insertUser();
      await findOrg()({ user }, {}, next);
      testNextCall(next, 404, "not found");
    });
    it("should return 404 if org is deleted", async () => {
      const { user } = await insertUser();
      await insertOrg({ _id: user.organizationId, deleted: new Date() });
      await findOrg()({ user }, {}, next);
      testNextCall(next, 404, "not found");
    });
    it("should return 404 if mustBeOwner and not owner", async () => {
      const { user } = await insertUser();
      await insertOrg({
        _id: user.organizationId,
        ownerId: new mongoose.Types.ObjectId(),
      });
      await findOrg(true)({ user }, {}, next);
      testNextCall(next, 404, "not found");
    });
    it("should add the org to the request if mustBeOwner and is owner", async () => {
      const { user } = await insertUser();
      await insertOrg({
        _id: user.organizationId,
        ownerId: user._id,
      });
      const req = { user };
      await findOrg(true)(req, {}, next);
      testNextCall(next);
      expect(req.org).not.toBeFalsy();
    });
    it("should add the org to the request if not mustBeOwner and is not owner", async () => {
      const { user } = await insertUser();
      await insertOrg({
        _id: user.organizationId,
        ownerId: new mongoose.Types.ObjectId(),
      });
      const req = { user };
      await findOrg(false)(req, {}, next);
      testNextCall(next);
      expect(req.org).not.toBeFalsy();
    });
  });
});
