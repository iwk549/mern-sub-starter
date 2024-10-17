const Joi = require("joi");
const { default: mongoose } = require("mongoose");
const { saltAndHashPassword } = require("./encryption.util");
const { accountSchema } = require("../models/account.model");
const { userSchema } = require("../models/user.model");

const genericLoginError = { status: 400, message: "Invalid login credentials" };

async function createNewUserTransaction(userInfo, existingAccount, queries) {
  const accountId = new mongoose.Types.ObjectId();
  queries.user = {
    collection: "users",
    query: "insertOne",
    data: {
      _id: new mongoose.Types.ObjectId(),
      accountId: existingAccount?._id || accountId,
      role: userInfo.role,
      name: userInfo.name,
      email: userInfo.email,
      organizationId: userInfo.organizationId,
    },
  };
  if (!existingAccount) {
    const authId = new mongoose.Types.ObjectId();
    const hashedPw = await saltAndHashPassword(userInfo.password);
    queries.account = {
      collection: "accounts",
      query: "insertOne",
      data: {
        _id: accountId,
        name: userInfo.name,
        email: userInfo.email,
        authId,
      },
    };
    queries.auth = {
      collection: "auths",
      query: "insertOne",
      data: {
        _id: authId,
        password: hashedPw,
        loginCode: null,
      },
    };
  }
}

function validateNewUser(userInfo) {
  return Joi.object({
    ...accountSchema,
    role: userSchema.role,
  }).validate(userInfo, {
    allowUnknown: true,
  });
}

function validateAccountUpdate(update) {
  return Joi.object({ name: accountSchema.name }).validate(update, {
    allowUnknown: true,
  });
}

module.exports = {
  validateAccountUpdate,
  genericLoginError,
  createNewUserTransaction,
  validateNewUser,
};
