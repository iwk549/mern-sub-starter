const emailValidator = require("../../middleware/emailValidator.mw");
const { testNextCall } = require("../testHelpers");

let next;
const email = "   TeSt1123AbcD@sTrUcTuReMaTe.com    ";
const lcEmail = "test1123abcd@structuremate.com";

describe("emailValidator", () => {
  beforeEach(() => {
    next = jest.fn();
  });
  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe("containedInObject", () => {
    it("should return 400 if email must exist and does not", () => {
      emailValidator(true, "obj")({ body: { obj: {} } }, {}, next);
      testNextCall(next, 400, "email is required");
    });
    it("should continue on if email does not exist", () => {
      emailValidator(false, "obj")({ body: { obj: {} } }, {}, next);
      testNextCall(next);
    });
    it("should trim and change email to lower case", () => {
      const req = { body: { obj: { email } } };
      emailValidator(true, "obj")(req, {}, next);
      testNextCall(next);
      expect(req.body.obj.email).toBe(lcEmail);
    });
  });
  describe("in req.body", () => {
    it("should return 400 if email must exist and does not", () => {
      emailValidator(true)({ body: {} }, {}, next);
      testNextCall(next, 400, "email is required");
    });
    it("should continue on if email does not exist", () => {
      emailValidator(false)({ body: {} }, {}, next);
      testNextCall(next);
    });
    it("should trim and change email to lower case", () => {
      const req = { body: { email } };
      emailValidator(true)(req, {}, next);
      testNextCall(next);
      expect(req.body.email).toBe(lcEmail);
    });
  });
  describe("in req.params", () => {
    it("should return 400 if email must exist and does not", () => {
      emailValidator(true, false, "email")({ params: {} }, {}, next);
      testNextCall(next, 400, "email is required");
    });
    it("should continue on if email does not exist", () => {
      emailValidator(false, false, "email")({ params: {} }, {}, next);
      testNextCall(next);
    });
    it("should trim and change email to lower case", () => {
      const req = { params: { email } };
      emailValidator(true, false, "email")(req, {}, next);
      testNextCall(next);
      expect(req.params.email).toBe(lcEmail);
    });
  });
});
