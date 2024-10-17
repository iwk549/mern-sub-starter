const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);

const orgMongooseSchema = new mongoose.Schema({
  name: { type: String, required: true, min: 3, max: 99 },
  ownerId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

const Organization = mongoose.model("Org", orgMongooseSchema);

const organizationSchema = {
  name: Joi.string().required().min(3).max(99).label("Organization Name"),
  ownerId: Joi.objectID().required(),
};

function validateOrganization(organization) {
  const schema = { name: organizationSchema.name };
  return Joi.object(schema).validate(organization);
}

exports.validateOrganization = validateOrganization;
exports.Organization = Organization;
