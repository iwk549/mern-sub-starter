const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);

const invitationMongooseSchema = new mongoose.Schema({
  email: { type: String, required: true },
  organizationId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Organization",
  },
  code: { type: String, required: true },
});

const Invitation = mongoose.model("Invitation", invitationMongooseSchema);

const invitationSchema = {
  email: Joi.string().email().required(),
  organizationId: Joi.objectID().required(),
  code: Joi.string().required(),
};

function validateInvitation(invitation) {
  const schema = { ...invitationSchema };
  return Joi.object(schema).validate(invitation);
}

exports.validateInvitation = validateInvitation;
exports.Invitation = Invitation;
