const { Project, validateProject } = require("../../models/project.model");
const { User } = require("../../models/user.model");
const { extractFilterFromRequest } = require("../../utils/schema.util");
const transactions = require("../../utils/transaction.util");

const filterOwner = (filter, user) => {
  if (user.role !== "owner") filter.ownerId = user._id;
};

function getProjects(ownedOnly) {
  return async (req, res) => {
    let filter = extractFilterFromRequest(req, ownedOnly ? "ownerId" : "");
    if (!ownedOnly) {
      const authedFilter = [
        { authedUsers: req.user._id },
        { ownerId: req.user._id },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: authedFilter }];
        delete filter.$or;
      } else filter.$or = authedFilter;
    }

    const projects = await Project.find(filter)
      .populate({
        path: "authedUsers",
        select: "name email",
      })
      .populate({ path: "ownerId", select: "name email" });

    res.json(projects);
  };
}

async function createNewProject(req, res, next) {
  delete req.body.organizationId;
  delete req.body.ownerId;

  req.body.ucName = req.body.name?.toUpperCase();
  const ex = validateProject(req.body);
  if (ex.error)
    return next({ status: 400, message: ex.error.details[0].message });

  const existingProject = await Project.findOne({
    ucName: req.body.name?.toUpperCase(),
    organizationId: req.user.organizationId,
  });
  if (existingProject)
    return next({
      status: 400,
      message: "A project by this name already exists",
    });

  req.body.organizationId = req.user.organizationId;
  req.body.ownerId = req.user._id;

  const project = new Project(req.body);
  await project.save();

  res.json(project);
}

async function updateProject(req, res, next) {
  const filter = extractFilterFromRequest(req);
  filter._id = req.params.id;

  const project = await Project.findOne(filter);
  if (!project) return next({ status: 404, message: "Project not found" });

  req.safeUpdateObject.ucName = req.safeUpdateObject.name?.toUpperCase();
  const ex = validateProject(req.safeUpdateObject);
  if (ex.error)
    return next({ status: 400, message: ex.error.details[0].message });

  const existingProject = await Project.findOne({
    ucName: req.safeUpdateObject.name?.toUpperCase(),
    organizationId: req.user.organizationId,
    _id: { $ne: req.params.id },
  });
  if (existingProject)
    return next({
      status: 400,
      message: "A project by this name already exists",
    });

  const update = await Project.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.safeUpdateObject },
    { returnOriginal: false }
  );
  res.json(update);
}

async function toggleAuthUserForProject(req, res, next) {
  const filter = extractFilterFromRequest(req);
  filter._id = req.params.id;

  const project = await Project.findOne(filter);
  if (!project) return next({ status: 404, message: "Project not found" });

  const user = await User.findOne({
    organizationId: req.user.organizationId,
    email: req.body.email,
  });
  if (!user) return next({ status: 404, message: "User not found" });

  let isAlreadyAuthed = !!project.authedUsers.find(
    (u) => String(u) === String(user._id)
  );

  await Project.updateOne(
    {
      _id: req.params.id,
    },
    isAlreadyAuthed
      ? { $pull: { authedUsers: user._id } }
      : { $push: { authedUsers: user._id } }
  );
  res.json(`User ${isAlreadyAuthed ? "removed" : "added"} to the project`);
}

async function toggleDeleteProject(req, res, next) {
  const filter = {
    organizationId: req.user.organizationId,
    _id: req.params.id,
  };
  filterOwner(filter, req.user);

  const project = await Project.findOne(filter);
  if (!project) return next({ status: 404, message: "Project not found" });

  const deleted = project.deleted ? null : new Date();
  const queries = {
    project: {
      collection: "projects",
      query: "updateOne",
      data: {
        filter: { _id: project._id },
        update: { $set: { deleted } },
      },
    },
    structure: {
      collection: "structures",
      query: "updateMany",
      data: {
        filter: { projectId: project._id },
        update: { $set: { deleted } },
      },
    },
  };

  transactions.executeTransactionAndReturn(
    queries,
    "Project was not deleted.",
    res,
    next
  );
}

module.exports = {
  getProjects,
  createNewProject,
  updateProject,
  toggleAuthUserForProject,
  toggleDeleteProject,
};
