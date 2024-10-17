const mongoose = require("mongoose");
const Joi = require("joi");
const { nameSchema, deletedSchema } = require("../utils/schema.util");
Joi.objectID = require("joi-objectid")(Joi);

const projectMongooseSchema = new mongoose.Schema({
  name: nameSchema.mongo,
  organizationId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Organization",
  },
  deleted: deletedSchema.mongo,
});

const Project = mongoose.model("Project", projectMongooseSchema);

const projectSchema = {
  name: nameSchema.joi,
  organizationId: Joi.objectID().required(),
  deleted: deletedSchema.joi,
};

function validateProject(project) {
  const schema = { ...projectSchema };
  return Joi.object(schema).validate(project);
}

exports.validateProject = validateProject;
exports.Project = Project;
