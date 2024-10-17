const { createSafeUpdateObject } = require("../../middleware/update.mw");
const { testNextCall } = require("../testHelpers");

let next;
describe("update.mw", () => {
  beforeEach(() => {
    next = jest.fn();
  });
  afterEach(async () => {
    jest.resetAllMocks();
  });

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
});
