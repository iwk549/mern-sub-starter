const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { deletedSchema, nameSchema } = require("../utils/schema.util");
Joi.objectID = require("joi-objectid")(Joi);

const roleHierarchy = [
  { name: "owner", level: 1 },
  { name: "admin", level: 2 },
  { name: "standard", level: 3 },
  { name: "readonly", level: 4 },
];

const roles = roleHierarchy.map((role) => role.name);

const userMongooseSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Account",
  },
  organizationId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Organization",
  },
  // email and name is required on both user and account to simplify queries
  name: nameSchema.mongo,
  email: { type: String, required: true, unique: false },
  role: { type: String, required: false, enum: roles },
  deleted: deletedSchema.mongo,
});

userMongooseSchema.methods.generateAuthToken = function (sessionId) {
  if (!process.env.JWT_KEY) throw new Error("key is not set");
  const token = jwt.sign(
    {
      _id: this._id,
      accountId: this.accountId._id,
      name: this.accountId.name,
      email: this.accountId.email,
      role: this.role,
      organizationId: this.organizationId,
      sessionId: String(sessionId),
    },
    process.env.JWT_KEY
  );
  return token;
};

const User = mongoose.model("User", userMongooseSchema);

const userSchema = {
  accountId: Joi.objectID().required(),
  organizationId: Joi.objectID().required(),
  name: nameSchema.joi,
  email: Joi.string().email().required(),
  role: Joi.string()
    .optional()
    .allow(...roles),
  deleted: deletedSchema.joi,
};

exports.userSchema = userSchema;
exports.roleHierarchy = roleHierarchy;
exports.roles = roles;
exports.User = User;
