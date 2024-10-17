const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);
const { nameSchema, deletedSchema } = require("../utils/schema.util");

const structureMongooseSchema = new mongoose.Schema({
  name: nameSchema.mongo,
  organizationId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Organization",
  },
  projectId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Project",
  },
  values: { type: Object, required: false },
  deleted: deletedSchema.mongo,
});

const Structure = mongoose.model("Structure", structureMongooseSchema);

const structureSchema = {
  name: nameSchema.joi,
  organizationId: Joi.objectID().required(),
  projectId: Joi.objectID().required(),
  values: Joi.object().optional(),
  deleted: deletedSchema.joi,
};

function validateStructure(structure) {
  const schema = { ...structureSchema };
  return Joi.object(schema).validate(structure);
}

exports.validateStructure = validateStructure;
exports.Structure = Structure;
