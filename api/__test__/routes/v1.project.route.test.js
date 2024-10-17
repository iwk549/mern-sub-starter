const mongoose = require("mongoose");
const request = require("supertest");

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
} = require("../testHelpers");
const { project: testProject, organizationId, user } = require("../testData");
const { Project } = require("../../models/project.model");
const { Structure } = require("../../models/structure.model");

let server;
const endpoint = "/api/v1/project";

describe("v1.project.route", () => {
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

  describe("GET /", () => {
    const exec = async (token, query = "") =>
      request(server)
        .get(endpoint + "?" + query)
        .set(authHeader, token);

    testAuth(exec);
    it("should return an empty array if there are no projects", async () => {
      const { token } = await insertUser();
      await insertOrg();
      const res = await exec(token);
      testResponse(res, 200);
      expect(res.body.length).toBe(0);
    });
    it("should return non deleted projects that user owns", async () => {
      const { user, token } = await insertUser();
      await insertProject({ organizationId: new mongoose.Types.ObjectId() });
      await insertProject({
        deleted: new Date(),
        ownerId: new mongoose.Types.ObjectId(),
      });
      await insertProject({ deleted: new Date(), ownerId: user._id });
      await insertProject({ ownerId: user._id });
      await insertProject({ ownerId: user._id });
      await insertOrg();
      const res = await exec(token);
      testResponse(res, 200);
      expect(res.body.length).toBe(2);
    });
    it("should return only deleted projects", async () => {
      const { user, token } = await insertUser();
      await insertProject({ ownerId: user._id });
      await insertProject({ ownerId: user._id, deleted: new Date() });
      await insertProject({ ownerId: user._id, deleted: new Date() });
      const res = await exec(token, "deleted=true");
      testResponse(res, 200);
      expect(res.body.length).toBe(2);
    });
    it("should return deleted and non-deleted projects", async () => {
      const { user, token } = await insertUser();
      await insertProject({ ownerId: user._id });
      await insertProject({ ownerId: user._id, deleted: new Date() });
      await insertProject({ ownerId: user._id, deleted: new Date() });
      const res = await exec(token, "deleted=include");
      testResponse(res, 200);
      expect(res.body.length).toBe(3);
    });
    it("should return all projects for org if owner", async () => {
      const { user, token } = await insertUser({ role: "owner" });
      await insertProject({ ownerId: new mongoose.Types.ObjectId() });
      await insertProject({ ownerId: user._id });
      await insertProject({ ownerId: user._id });
      const res = await exec(token, "all=true");
      testResponse(res, 200);
      expect(res.body.length).toBe(3);
    });
  });

  describe("GET /authed", () => {
    const exec = async (token) =>
      request(server)
        .get(endpoint + "/authed")
        .set(authHeader, token);

    testAuth(exec);
    it("should return non deleted projects that user owns", async () => {
      const { user, token } = await insertUser();
      await insertProject({ organizationId: new mongoose.Types.ObjectId() });
      await insertProject({
        deleted: new Date(),
        ownerId: new mongoose.Types.ObjectId(),
      });
      await insertProject({ deleted: new Date(), ownerId: user._id });
      await insertProject({ ownerId: user._id });
      await insertProject({ ownerId: user._id });
      await insertOrg();
      const res = await exec(token);
      testResponse(res, 200);
      expect(res.body.length).toBe(2);
    });
    it("should return projects for which the user is authorized or owner", async () => {
      const { user, token } = await insertUser({ role: "owner" });
      await insertProject({ authedUsers: [user._id] });
      await insertProject({ authedUsers: [user._id] });
      await insertProject({ ownerId: user._id });
      await insertProject({ authedUsers: [new mongoose.Types.ObjectId()] });
      const res = await exec(token);
      testResponse(res, 200);
      expect(res.body.length).toBe(3);
    });
  });

  describe("POST /", () => {
    const exec = async (token, project) =>
      request(server).post(endpoint).set(authHeader, token).send(project);

    testAuth(exec, "admin");
    it("should return 400 if project is invalid", async () => {
      const { token } = await insertUser();
      const res = await exec(token, { invalidField: "xxx" });
      testResponse(res, 400, "required");
    });
    it("should return 400 if project by same name exists in org", async () => {
      const { token } = await insertUser();
      await insertProject();
      const res = await exec(token, testProject);
      testResponse(res, 400, "name already exists");
    });
    it("should save and return the project", async () => {
      const { token } = await insertUser();
      const res = await exec(token, testProject);
      testResponse(res, 200);
      expect(res.body).toMatchObject({
        name: testProject.name,
        organizationId: String(organizationId),
      });
    });
  });

  describe("PUT /:id", () => {
    const exec = async (token, projectId, project) =>
      request(server)
        .put(endpoint + "/" + projectId)
        .set(authHeader, token)
        .send(project);

    testAuth(exec, "admin", false, true);
    it("should return 404 if project does not exist", async () => {
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId());
      testResponse(res, 404, "project not found");
    });
    it("should return 404 if user is not owner of org or project", async () => {
      const { token } = await insertUser();
      const project = await insertProject({
        ownerId: new mongoose.Types.ObjectId(),
        authedUsers: [],
      });
      const res = await exec(token, project._id);
      testResponse(res, 404, "project not found");
    });
    it("should return 400 if update is invalid", async () => {
      const { token, user } = await insertUser();
      const project = await insertProject({ ownerId: user._id });
      const res = await exec(token, project._id);
      testResponse(res, 400, "required");
    });
    it("should return 400 if project by same name exists in org", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ ownerId: user._id });
      await insertProject({ name: "New Name", ucName: "NEW NAME" });
      await insertProject({ name: testProject.name });
      const res = await exec(token, project._id, {
        name: "New Name",
        organizationId: new mongoose.Types.ObjectId(),
        ownerId: new mongoose.Types.ObjectId(),
      });
      testResponse(res, 400, "name already exists");
    });
    it("should update only the allowed values", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ ownerId: user._id });
      const res = await exec(token, project._id, {
        name: "New Name",
        organizationId: new mongoose.Types.ObjectId(),
        ownerId: new mongoose.Types.ObjectId(),
      });
      testResponse(res, 200);
      expect(res.body).toMatchObject({
        name: "New Name",
        ownerId: String(user._id),
        organizationId: String(user.organizationId),
      });
    });
  });

  describe("PUT /authuser/:id", () => {
    const exec = async (token, projectId, user) =>
      request(server)
        .put(endpoint + "/authuser/" + projectId)
        .set(authHeader, token)
        .send(user);

    testAuth(exec, "admin", false, true);
    it("should return 400 if email is not provided", async () => {
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId());
      testResponse(res, 400, "email is required");
    });
    it("should return 404 if project not found", async () => {
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId(), {
        email: "test@test.com",
      });
      testResponse(res, 404, "project not found");
    });
    it("should return 404 if user is not owner of project", async () => {
      const { token } = await insertUser();
      const project = await insertProject({
        ownerId: new mongoose.Types.ObjectId(),
      });
      const res = await exec(token, project._id, { email: "auth@test.com" });
      testResponse(res, 404, "project not found");
    });
    it("should return 404 if the user is not found in the org", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({
        ownerId: user._id,
      });
      const res = await exec(token, project._id, { email: "auth@test.com" });
      testResponse(res, 404, "user not found");
    });
    it("should add the user to the auth array", async () => {
      const { user, token } = await insertUser();
      const { user: user2 } = await insertUser(
        false,
        { email: "auth@test.com" },
        {},
        {},
        true
      );
      const project = await insertProject({
        ownerId: user._id,
      });
      const res = await exec(token, project._id, { email: "auth@test.com" });
      testResponse(res, 200);

      const updatedProject = await Project.findById(project._id);
      expect(
        updatedProject.authedUsers.find((u) => String(u) === String(user2._id))
      ).not.toBeFalsy();
    });
    it("should remove the user to the auth array", async () => {
      const { user, token } = await insertUser();
      const { user: user2 } = await insertUser(
        false,
        { email: "auth@test.com" },
        {},
        {},
        true
      );
      const project = await insertProject({
        ownerId: user._id,
        authedUsers: [user2._id],
      });
      const res = await exec(token, project._id, { email: "auth@test.com" });
      testResponse(res, 200);

      const updatedProject = await Project.findById(project._id);
      expect(
        updatedProject.authedUsers.find((u) => String(u) === String(user2._id))
      ).toBeFalsy();
    });
  });

  describe("DELETE /:id", () => {
    const exec = async (token, projectId) =>
      request(server)
        .delete(endpoint + "/" + projectId)
        .set(authHeader, token);

    testAuth(exec, "admin", false, true);
    it("should return 404 if project is not found", async () => {
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId());
      testResponse(res, 404, "project not found");
    });
    it("should mark the project and all related modules as deleted", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ ownerId: user._id });
      await insertStructure({ projectId: project._id });
      await insertStructure({ projectId: project._id });
      await insertStructure({ projectId: project._id });
      await insertStructure({ projectId: new mongoose.Types.ObjectId() });
      const res = await exec(token, project._id);
      testResponse(res, 200);

      const deletedProject = await Project.findById(project._id);
      const allStructures = await Structure.find();

      expect(deletedProject.deleted).toEqual(expect.any(Date));
      allStructures.forEach((s) => {
        if (String(s.projectId) === String(project._id))
          expect(s.deleted).toEqual(expect.any(Date));
        else expect(s.deleted).toBeFalsy();
      });
    });
    it("should mark the project and all related modules as NOT deleted", async () => {
      const { user, token } = await insertUser();
      const deleted = new Date();
      const project = await insertProject({ ownerId: user._id, deleted });
      await insertStructure({ projectId: project._id, deleted });
      await insertStructure({ projectId: project._id, deleted });
      await insertStructure({ projectId: project._id, deleted });
      await insertStructure({ projectId: new mongoose.Types.ObjectId() });
      const res = await exec(token, project._id);
      testResponse(res, 200);

      const deletedProject = await Project.findById(project._id);
      const allStructures = await Structure.find();

      expect(deletedProject.deleted).toBeNull();
      allStructures.forEach((s) => {
        expect(s.deleted).toBeFalsy();
      });
    });
  });
});
