const {
  createSafeUpdateObject,
  validateObjectId,
} = require("../../middleware/update.mw");
const { testNextCall } = require("../testHelpers");

let next;
describe("update.mw", () => {
  beforeEach(() => {
    next = jest.fn();
  });
  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe("createSafeUpdateObject", () => {
    it("should throw an error if invalid model name passed", () => {
      expect(() => createSafeUpdateObject("invalid")().toThrow());
    });
    test("account update", () => {
      const req = {
        body: {
          name: "something",
          invalidField: "to be discarded",
        },
      };
      createSafeUpdateObject("account")(req, {}, next);
      testNextCall(next);
      expect(req.body).toMatchObject({
        name: "something",
      });
    });
    test("organization update", () => {
      const req = {
        body: {
          name: "something",
          invalidField: "to be discarded",
        },
      };
      createSafeUpdateObject("organization")(req, {}, next);
      testNextCall(next);
      expect(req.body).toMatchObject({
        name: "something",
      });
    });
    test("project update", () => {
      const req = {
        body: {
          name: "something",
          invalidField: "to be discarded",
        },
      };
      createSafeUpdateObject("project")(req, {}, next);
      testNextCall(next);
      expect(req.body).toMatchObject({
        name: "something",
      });
    });
  });

  describe("validateObjectId", () => {
    it("should return 400 if id is not in params", () => {
      validateObjectId({ params: {} }, {}, next);
      testNextCall(next, 400, "invalid id");
    });
    it("should return 400 if id is invalid", () => {
      validateObjectId({ params: { id: "xxx" } }, {}, next);
      testNextCall(next, 400, "invalid id");
    });
  });
});
