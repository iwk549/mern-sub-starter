const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);

const projectMongooseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  orgId: { type: mongoose.Types.ObjectId, required: true, ref: "Org" },
});

const Project = mongoose.model("Project", projectMongooseSchema);

const projectSchema = {
  name: Joi.string().required().min(3).max(20),
  org: Joi.objectID().required(),
};

function validateProject(project) {
  const schema = { ...projectSchema };
  return Joi.object(schema).validate(project);
}

exports.validateProject = validateProject;
exports.Project = Project;
