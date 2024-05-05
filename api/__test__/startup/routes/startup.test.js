const request = require("supertest");
const { shutdownServer } = require("../../testHelpers");

let server;

describe("routes.startup", () => {
  beforeAll(() => {
    if (process.env.NODE_ENV === "test") server = require("../../../index");
    else throw "Not in test environment";
  });
  afterAll(async () => {
    await shutdownServer(server);
  });

  describe("Health Route", () => {
    const exec = async () => request(server).get("/healthz");
    it("should return 200 if server is running", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
});
