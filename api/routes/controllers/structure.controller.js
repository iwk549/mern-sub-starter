const { extractFilterFromRequest } = require("../../utils/schema.util");
const {
  Structure,
  validateStructure,
} = require("../../models/structure.model");
const { Project } = require("../../models/project.model");
const { isUserAuthed } = require("../../utils/project.util");

async function getStructures(req, res) {
  const filter = extractFilterFromRequest(req, null);
  filter.projectId = req.params.id;

  const structures = await Structure.find(filter)
    .select("-values")
    .populate({ path: "checkedOutTo", select: "name email" });
  res.json(structures);
}

function getStructure(forceCheckout) {
  return async (req, res, next) => {
    const filter = extractFilterFromRequest(req, null);
    filter._id = req.params.id;

    const structure = await Structure.findOne(filter)
      .populate({
        path: "checkedOutTo",
        select: "name email",
      })
      .populate("projectId")
      .lean();
    if (!structure) return next({ status: 404, message: "Module not found" });

    if (!isUserAuthed(structure.projectId, req.user))
      return next({
        status: 403,
        message: "You are not authorized on this project",
      });

    if (!structure.checkedOutTo || forceCheckout) {
      await Structure.updateOne(
        {
          _id: req.params.id,
        },
        { $set: { checkedOutTo: req.user._id } }
      );
      structure.checkedOutTo = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      };
    }

    res.json(structure);
  };
}

async function createStructure(req, res, next) {
  const filter = extractFilterFromRequest(req);
  filter._id = req.body.projectId;

  const project = await Project.findOne(filter);
  if (!project) return next({ status: 404, message: "Project not found" });

  delete req.body.projectId;
  delete req.body.organizationId;
  req.body.ucName = req.body.name?.toUpperCase();
  const ex = validateStructure(req.body);
  if (ex.error)
    return next({ status: 400, message: ex.error.details[0].message });

  const existingStructure = await Structure.findOne({
    ucName: req.body.name?.toUpperCase(),
    organizationId: req.user.organizationId,
    projectId: project._id,
  });
  if (existingStructure)
    return next({
      status: 400,
      message: "A module by this name already exists in this project",
    });

  req.body.projectId = project._id;
  req.body.organizationId = req.user.organizationId;
  req.body.checkedOutTo = req.user._id;

  const structure = new Structure(req.body);
  await structure.save();

  res.json(structure);
}

async function updateStructure(req, res, next) {
  const filter = extractFilterFromRequest(req, null);
  const structure = await Structure.findOne({
    ...filter,
    _id: req.params.id,
  }).populate("projectId");
  if (!structure) return next({ status: 404, message: "Module not found" });

  if (
    structure.checkedOutTo &&
    String(structure.checkedOutTo) !== String(req.user._id)
  )
    return next({
      status: 403,
      message: "This module is checked out to another user",
    });

  if (!isUserAuthed(structure.projectId, req.user))
    return next({
      status: 403,
      message: "You are not authorized on this project",
    });

  req.safeUpdateObject.ucName = req.safeUpdateObject.name?.toUpperCase();
  const ex = validateStructure(req.safeUpdateObject, true);
  if (ex.error)
    return next({ status: 400, message: ex.error.details[0].message });

  const existingStructure = await Structure.findOne({
    ucName: req.safeUpdateObject.name?.toUpperCase(),
    organizationId: req.user.organizationId,
    projectId: structure.projectId?._id,
    _id: { $ne: structure._id },
  });
  if (existingStructure)
    return next({
      status: 400,
      message: "A module by this name already exists in this project",
    });

  const checkedOutTo = req.query.checkin ? null : req.user._id;
  const update = await Structure.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    { $set: { ...req.safeUpdateObject, checkedOutTo } },
    { returnOriginal: false }
  );

  res.json(update);
}

function checkinStructure(force) {
  return async (req, res, next) => {
    const filter = extractFilterFromRequest(req, null);
    filter._id = req.params.id;

    const structure = await Structure.findOne(filter).populate("projectId");
    if (!structure) return next({ status: 404, message: "Module not found" });

    if (!isUserAuthed(structure.projectId, req.user))
      return next({
        status: 403,
        message: "You are not authorized on this project",
      });

    if (!force && String(structure.checkedOutTo) !== String(req.user._id))
      return next({
        status: 403,
        message: "This module is checked out to another user",
      });

    await Structure.updateOne(
      { _id: req.params.id },
      { $set: { checkedOutTo: null } }
    );

    res.json("Checked in");
  };
}

async function deleteStructure(req, res, next) {
  const filter = extractFilterFromRequest(req, null);
  filter._id = req.params.id;
  const structure = await Structure.findOne(filter).populate("projectId");
  if (!structure) return next({ status: 404, message: "Module not found" });

  if (!isUserAuthed(structure.projectId, req.user))
    return next({
      status: 403,
      message: "You are not authorized on this project",
    });

  await Structure.updateOne(
    {
      _id: req.params.id,
    },
    { $set: { deleted: new Date(), checkedOutTo: null } }
  );

  res.json("Module deleted");
}

module.exports = {
  getStructures,
  getStructure,
  createStructure,
  updateStructure,
  checkinStructure,
  deleteStructure,
};
