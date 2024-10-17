const mongoose = require("mongoose");
const Joi = require("joi");
const { nameSchema, deletedSchema } = require("../utils/schema.util");
Joi.objectID = require("joi-objectid")(Joi);

const orgMongooseSchema = new mongoose.Schema({
  name: { ...nameSchema.mongo, unique: true },
  ownerId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  deleted: deletedSchema.mongo,
});

const Organization = mongoose.model("Organization", orgMongooseSchema);

const organizationSchema = {
  name: nameSchema.joi.label("Organization Name"),
  ownerId: Joi.objectID().required(),
  deleted: deletedSchema.joi,
};

function validateOrganization(organization) {
  const schema = { name: organizationSchema.name };
  return Joi.object(schema).validate(organization);
}

exports.validateOrganization = validateOrganization;
exports.Organization = Organization;
