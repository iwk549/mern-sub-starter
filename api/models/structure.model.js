const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);
const { nameSchema, deletedSchema } = require("../utils/schema.util");

const structureMongooseSchema = new mongoose.Schema({
  name: nameSchema.mongo,
  ucName: nameSchema.mongo,
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
  checkedOutTo: {
    type: mongoose.Types.ObjectId,
    required: false,
    ref: "User",
  },
  material: nameSchema.mongo,
  module: nameSchema.mongo,
  values: { type: Object, required: true },
  deleted: deletedSchema.mongo,
});

const Structure = mongoose.model("Structure", structureMongooseSchema);

const structureSchema = {
  name: nameSchema.joi,
  ucName: nameSchema.joi,
  organizationId: Joi.objectID().required(),
  projectId: Joi.objectID().required(),
  material: nameSchema.joi,
  module: nameSchema.joi,
  values: Joi.object().required(),
  checkedOutTo: Joi.objectID().optional(),
  deleted: deletedSchema.joi,
};

function validateStructure(structure, isUpdate) {
  const schema = { ...structureSchema };
  delete schema.projectId;
  delete schema.organizationId;
  delete schema.checkedOutTo;
  if (isUpdate) {
    delete schema.material;
    delete schema.module;
  }
  return Joi.object(schema).validate(structure);
}

exports.validateStructure = validateStructure;
exports.Structure = Structure;
