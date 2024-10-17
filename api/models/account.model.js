const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectID = require("joi-objectid")(Joi);

const accountMongooseSchema = new mongoose.Schema({
  name: { type: String, required: true, min: 3, max: 99 },
  email: { type: String, required: true, unique: true },
  authId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
});

const Account = mongoose.model("Account", accountMongooseSchema);

const accountSchema = {
  name: Joi.string().required().min(3).max(99).label("User Name"),
  email: Joi.string().required().email().label("Email"),
};

exports.Account = Account;
exports.accountSchema = accountSchema;
