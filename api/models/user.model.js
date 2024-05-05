const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);

const { passwordSchema } = require("./auth.model");

const roles = ["admin", "user"];

const userMongooseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: false, enum: roles },
  authId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
});

userMongooseSchema.methods.generateAuthToken = function (sessionId) {
  if (!process.env.JWT_KEY) throw new Error("key is not set");
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      sessionId: String(sessionId),
    },
    process.env.JWT_KEY
  );
  return token;
};

const User = mongoose.model("User", userMongooseSchema);

const userSchema = {
  name: Joi.string().required().min(3).max(20),
  email: Joi.string().email().required(),
  role: Joi.string()
    .optional()
    .allow(...roles),
};

function validateUser(user, isNew) {
  const schema = { ...userSchema };
  if (isNew) schema.password = passwordSchema;
  return Joi.object(schema).validate(user);
}

exports.validateUser = validateUser;
exports.User = User;
