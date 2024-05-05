const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const passwordComplexityOptions = {
  min: 8,
  max: 50,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 3,
};

const authMongooseSchema = new mongoose.Schema({
  password: { type: String, required: true },
  loginCode: {
    type: Object,
    required: false,
    keys: {
      code: { type: String, required: true, minLength: 6, maxLength: 6 },
      validThru: { type: Date, required: true },
    },
  },
});

const Auth = mongoose.model("Auth", authMongooseSchema);

const passwordSchema = Joi.string().required().min(8).max(256);

const authSchema = {
  password: passwordSchema,
  loginCode: Joi.object()
    .optional()
    .keys({
      code: Joi.string().required().min(6).max(6),
      validThru: Joi.date().required(),
    })
    .allow(null),
};

function validateAuth(auth) {
  return Joi.object(authSchema).validate(auth);
}

function validatePassword(password) {
  return passwordComplexity(passwordComplexityOptions, "Password").validate(
    password
  );
}

exports.validatePassword = validatePassword;
exports.passwordSchema = passwordSchema;
exports.validateAuth = validateAuth;
exports.Auth = Auth;
