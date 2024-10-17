const mongoose = require("mongoose");
const Joi = require("joi");
const { nameSchema, deletedSchema } = require("../utils/schema.util");
Joi.objectID = require("joi-objectid")(Joi);

const accountMongooseSchema = new mongoose.Schema({
  name: nameSchema.mongo,
  email: { type: String, required: true, unique: true },
  authId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
  deleted: deletedSchema.mongo,
});

const Account = mongoose.model("Account", accountMongooseSchema);

const accountSchema = {
  name: nameSchema.joi.label("User Name"),
  email: Joi.string().required().email().label("Email"),
  deleted: deletedSchema.joi,
};

exports.Account = Account;
exports.accountSchema = accountSchema;
