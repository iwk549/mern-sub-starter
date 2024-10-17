const errorHandler = require("../../middleware/errorHandler.mw");

let next;
let res;

describe("errorHandler.mw", () => {
  beforeEach(() => {
    next = jest.fn();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });
  afterEach(async () => {
    jest.resetAllMocks();
  });

  it("should return the passed error", async () => {
    errorHandler({ status: 400, message: "test" }, {}, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith("test");
  });
  it("should return the default server error", async () => {
    errorHandler({}, {}, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Something went wrong");
  });
});
