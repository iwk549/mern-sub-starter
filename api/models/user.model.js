const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);

const { passwordSchema } = require("./auth.model");

const roles = ["admin", "user"];

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
  role: { type: String, required: false, enum: roles },
});

userMongooseSchema.methods.generateAuthToken = function (sessionId) {
  if (!process.env.JWT_KEY) throw new Error("key is not set");
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.accountId.name,
      email: this.accountId.email,
      role: this.role,
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
  role: Joi.string()
    .optional()
    .allow(...roles),
};

exports.userSchema = userSchema;
exports.User = User;
