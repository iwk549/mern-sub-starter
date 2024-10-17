const mongoose = require("mongoose");
const Joi = require("joi");
const { nameSchema, deletedSchema } = require("../utils/schema.util");
Joi.objectID = require("joi-objectid")(Joi);

const projectMongooseSchema = new mongoose.Schema({
  name: nameSchema.mongo,
  ucName: nameSchema.mongo,
  organizationId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Organization",
  },
  ownerId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  authedUsers: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  deleted: deletedSchema.mongo,
});

const Project = mongoose.model("Project", projectMongooseSchema);

const projectSchema = {
  name: nameSchema.joi,
  ucName: nameSchema.joi,
  organizationId: Joi.objectID().required(),
  ownerId: Joi.objectID().required(),
  authedUsers: Joi.array().items(Joi.objectID()),
  deleted: deletedSchema.joi,
};

function validateProject(project) {
  const schema = { ...projectSchema };
  delete schema.organizationId;
  delete schema.ownerId;
  return Joi.object(schema).validate(project);
}

exports.validateProject = validateProject;
exports.Project = Project;
