const mongoose = require("mongoose");
const request = require("supertest");

const {
  clearDb,
  testResponse,
  shutdownServer,
  authHeader,
  testAuth,
  insertUser,
  insertProject,
  insertStructure,
} = require("../testHelpers");
const { structure: testStructure } = require("../testData");
const { Structure } = require("../../models/structure.model");

let server;
const endpoint = "/api/v1/module";

describe("v1.structure.route", () => {
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
    const exec = async (token, projectId, query) =>
      request(server)
        .get(endpoint + "/project/" + projectId + "?" + query)
        .set(authHeader, token);

    testAuth(exec, null, false, true);
    it("should return an empty array", async () => {
      await insertStructure({
        projectId: new mongoose.Types.ObjectId(),
      });
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId());
      testResponse(res, 200);
      expect(res.body.length).toBe(0);
    });
    it("should return non deleted structures for the project", async () => {
      await insertStructure({
        projectId: new mongoose.Types.ObjectId(),
      });
      const struct = await insertStructure();
      await insertStructure();
      await insertStructure();

      const { token } = await insertUser();
      const res = await exec(token, struct.projectId);
      testResponse(res, 200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].values).toBeUndefined();
    });
    it("should return only deleted structures for the project", async () => {
      await insertStructure({
        projectId: new mongoose.Types.ObjectId(),
      });
      const struct = await insertStructure();
      await insertStructure();
      await insertStructure({ deleted: new Date() });

      const { token } = await insertUser();
      const res = await exec(token, struct.projectId, "deleted=true");
      testResponse(res, 200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].values).toBeUndefined();
    });
    it("should return deleted and non deleted structures for the project", async () => {
      await insertStructure({
        projectId: new mongoose.Types.ObjectId(),
      });
      const struct = await insertStructure();
      await insertStructure();
      await insertStructure({ deleted: new Date() });

      const { token } = await insertUser();
      const res = await exec(token, struct.projectId, "deleted=true");
      testResponse(res, 200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].values).toBeUndefined();
    });
    it("should return all structures for the project", async () => {
      await insertStructure({
        projectId: new mongoose.Types.ObjectId(),
      });
      const struct = await insertStructure();
      await insertStructure();
      await insertStructure({ deleted: new Date() });

      const { token } = await insertUser();
      const res = await exec(token, struct.projectId, "deleted=include");
      testResponse(res, 200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].values).toBeUndefined();
    });
    it("should show who has the structure checked out", async () => {
      const { user, token } = await insertUser();
      const struct = await insertStructure({
        checkedOutTo: user._id,
      });

      const res = await exec(token, struct.projectId);
      testResponse(res, 200);
      expect(res.body[0].checkedOutTo).toMatchObject({
        _id: String(user._id),
        name: user.name,
      });
    });
  });

  describe("GET /:id", () => {
    const exec = async (token, structureId, query) =>
      request(server)
        .get(endpoint + "/" + structureId + "?" + query)
        .set(authHeader, token);

    testAuth(exec, null, false, true);
    it("should return 404 if structure is not found", async () => {
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId());
      testResponse(res, 404, "module not found");
    });
    it("should return 400 if user is not authed on that project", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({
        authedUsers: [],
        ownerId: new mongoose.Types.ObjectId(),
      });
      const struct = await insertStructure({
        projectId: project._id,
      });
      const res = await exec(token, struct._id);
      testResponse(res, 403, "not authorized");
    });
    it("should update checked out if not already checked out", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({
        authedUsers: [user._id],
      });
      const struct = await insertStructure({ projectId: project._id });
      const res = await exec(token, struct._id);
      testResponse(res, 200);
      expect(res.body).toMatchObject({
        name: struct.name,
        values: struct.values,
        checkedOutTo: {
          _id: String(user._id),
          name: user.name,
          email: user.email,
        },
      });
    });
    it("should not update checked out if already checked out", async () => {
      const { user, token } = await insertUser();
      const { user: user2 } = await insertUser(
        false,
        {
          _id: new mongoose.Types.ObjectId(),
        },
        {},
        {},
        true
      );
      const project = await insertProject({ authedUsers: [user._id] });
      const struct = await insertStructure({
        projectId: project._id,
        checkedOutTo: user2._id,
      });
      const res = await exec(token, struct._id);
      testResponse(res, 200);
      expect(res.body).toMatchObject({
        name: struct.name,
        values: struct.values,
        checkedOutTo: {
          _id: String(user2._id),
          name: user2.name,
          email: user2.email,
        },
      });
    });
  });

  describe("GET /force/:id", () => {
    const exec = async (token, structureId, query) =>
      request(server)
        .get(endpoint + "/force/" + structureId + "?" + query)
        .set(authHeader, token);

    testAuth(exec, null, false, true);
    // only need to test the forceCheckout param here
    // all other paths are tested in GET /:id
    it("should force the checkout even if structure is already checked out", async () => {
      const { user, token } = await insertUser();
      const { user: user2 } = await insertUser(
        false,
        {
          _id: new mongoose.Types.ObjectId(),
        },
        {},
        {},
        true
      );
      const project = await insertProject({ authedUsers: [user._id] });
      const struct = await insertStructure({
        projectId: project._id,
        checkedOutTo: user2._id,
      });
      const res = await exec(token, struct._id);
      testResponse(res, 200);
      expect(res.body).toMatchObject({
        name: struct.name,
        values: struct.values,
        checkedOutTo: {
          _id: String(user._id),
          name: user.name,
          email: user.email,
        },
      });
    });
  });

  describe("PUT /checkin/:id", () => {
    const exec = async (token, structureId) =>
      request(server)
        .put(endpoint + "/checkin/" + structureId)
        .set(authHeader, token);

    testAuth(exec, null, false, true);
    it("should return 404 if structure is not found", async () => {
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId());
      testResponse(res, 404, "module not found");
    });
    it("should return 403 if user not authed on project", async () => {
      const { token } = await insertUser();
      const project = await insertProject({
        ownerId: new mongoose.Types.ObjectId(),
      });
      const struct = await insertStructure({ projectId: project._id });
      const res = await exec(token, struct._id);
      testResponse(res, 403, "not authorized");
    });
    it("should return 403 if user does not have the structure checked out", async () => {
      const { token } = await insertUser();
      const project = await insertProject({
        ownerId: new mongoose.Types.ObjectId(),
      });
      const struct = await insertStructure({ projectId: project._id });
      const res = await exec(token, struct._id);
      testResponse(res, 403, "not authorized");
    });
    it("should check the structure in", async () => {
      const { token, user } = await insertUser();
      const project = await insertProject({
        ownerId: new mongoose.Types.ObjectId(),
        authedUsers: [user._id],
      });
      const struct = await insertStructure({
        projectId: project._id,
        checkedOutTo: user._id,
      });
      const res = await exec(token, struct._id);
      testResponse(res, 200);
      const updatedStruct = await Structure.findById(struct._id);
      expect(updatedStruct.checkedOutTo).toBeNull();
    });
  });

  describe("PUT /force/checkin/:id", () => {
    const exec = async (token, structureId) =>
      request(server)
        .put(endpoint + "/force/checkin/" + structureId)
        .set(authHeader, token);

    testAuth(exec, "admin", null, true);
    it("should force checkin the structure", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({
        ownerId: new mongoose.Types.ObjectId(),
        authedUsers: [user._id],
      });
      const struct = await insertStructure({
        projectId: project._id,
        checkedOutTo: new mongoose.Types.ObjectId(),
      });
      const res = await exec(token, struct._id);
      testResponse(res, 200);
      const updatedStruct = await Structure.findById(struct._id);
      expect(updatedStruct.checkedOutTo).toBeNull();
    });
  });

  describe("POST /", () => {
    const exec = async (token, structure) =>
      request(server).post(endpoint).set(authHeader, token).send(structure);

    testAuth(exec, "standard");
    it("should return 404 if structure is not found", async () => {
      const { token } = await insertUser();
      const res = await exec(token);
      testResponse(res, 404, "project not found");
    });
    it("should return 400 if structure is not valid", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ ownerId: user._id });
      const res = await exec(token, { projectId: project._id });
      testResponse(res, 400, "is required");
    });
    it("should return 400 if name is in use", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ ownerId: user._id });
      await insertStructure({ projectId: project._id });
      const res = await exec(token, {
        ...testStructure,
        projectId: project._id,
      });
      testResponse(res, 400, "name already exists");
    });
    it("should save the structure and check it out to the user", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ ownerId: user._id });
      const res = await exec(token, {
        ...testStructure,
        projectId: project._id,
      });
      testResponse(res, 200);
      expect(res.body).toMatchObject({
        ...testStructure,
        projectId: String(project._id),
        checkedOutTo: String(user._id),
        organizationId: String(user.organizationId),
      });
    });
  });

  describe("PUT /:id", () => {
    const exec = async (token, structureId, structure, query) =>
      request(server)
        .put(endpoint + "/" + structureId + "?" + query)
        .set(authHeader, token)
        .send(structure);

    testAuth(exec, "standard", false, true);
    it("should return 404 if structure is not found", async () => {
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId());
      testResponse(res, 404, "module not found");
    });
    it("should return 403 if structure is checked out to another user", async () => {
      const { token } = await insertUser();
      const project = await insertProject();
      const struct = await insertStructure({
        projectId: project._id,
        checkedOutTo: new mongoose.Types.ObjectId(),
      });
      const res = await exec(token, struct._id, {
        projectId: project._id,
        name: "New Name",
        values: {},
      });
      testResponse(res, 403, "checked out");
    });
    it("should return 403 if user not authed on project", async () => {
      const { token, user } = await insertUser();
      const project = await insertProject({ authedUsers: [user._id] });
      const struct = await insertStructure();
      const res = await exec(token, struct._id);
      testResponse(res, 403, "not authorized");
    });
    it("should return 400 if update is not valid", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ authedUsers: [user._id] });
      const struct = await insertStructure({ projectId: project._id });
      const res = await exec(token, struct._id, { projectId: project._id });
      testResponse(res, 400, "required");
    });
    it("should return 400 if name is in use", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ authedUsers: [user._id] });
      await insertStructure({
        projectId: project._id,
        name: "new name",
        ucName: "NEW NAME",
      });
      const struct = await insertStructure({ projectId: project._id });
      const res = await exec(
        token,
        struct._id,
        {
          name: "New Name",
          values: {},
        },
        "checkin=true"
      );
      testResponse(res, 400, "name already exists");
    });
    it("should checkin the structure if indicated", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ authedUsers: [user._id] });
      const struct = await insertStructure({ projectId: project._id });
      const updatedValues = {
        a: "1",
        b: "2",
        c: "3",
      };
      const res = await exec(
        token,
        struct._id,
        {
          projectId: project._id,
          name: "New Name",
          values: updatedValues,
          module: "new module",
          material: "new material",
        },
        "checkin=true"
      );
      testResponse(res, 200);

      expect(res.body).toMatchObject({
        name: "New Name",
        values: updatedValues,
        checkedOutTo: null,
        projectId: String(project._id),
        organizationId: String(user.organizationId),
        material: struct.material,
        module: struct.module,
      });
    });
    it("should update only allowed values", async () => {
      const { user, token } = await insertUser();
      const project = await insertProject({ authedUsers: [user._id] });
      const struct = await insertStructure({ projectId: project._id });
      const updatedValues = {
        a: "1",
        b: "2",
        c: "3",
      };
      const res = await exec(token, struct._id, {
        projectId: project._id,
        name: "New Name",
        values: updatedValues,
        module: "new module",
        material: "new material",
      });
      testResponse(res, 200);

      expect(res.body).toMatchObject({
        name: "New Name",
        values: updatedValues,
        checkedOutTo: String(user._id),
        projectId: String(project._id),
        organizationId: String(user.organizationId),
        material: struct.material,
        module: struct.module,
      });
    });
  });

  describe("DELETE /:id", () => {
    const exec = async (token, structureId) =>
      request(server)
        .delete(endpoint + "/" + structureId)
        .set(authHeader, token);

    testAuth(exec, "admin", false, true);
    it("should return 404 if structure is not found", async () => {
      const { token } = await insertUser();
      const res = await exec(token, new mongoose.Types.ObjectId());
      testResponse(res, 404, "module not found");
    });
    it("should return 403 if user not authed on project", async () => {
      const { token } = await insertUser();
      const project = await insertProject({
        authedUsers: [],
        ownerId: new mongoose.Types.ObjectId(),
      });
      const struct = await insertStructure({ projectId: project._id });
      const res = await exec(token, struct._id);
      testResponse(res, 403, "not authorized");
    });
    it("should makr the structure as deleted and check it in", async () => {
      const { token, user } = await insertUser();
      const project = await insertProject({
        authedUsers: [user._id],
      });
      const struct = await insertStructure({ projectId: project._id });
      const res = await exec(token, struct._id);
      testResponse(res, 200);
      const updatedStruct = await Structure.findById(struct._id).lean();
      expect(updatedStruct).toMatchObject({
        deleted: expect.any(Date),
        checkedOutTo: null,
      });
    });
  });
});
