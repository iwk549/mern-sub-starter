const mongoose = require("mongoose");
const { User, validateUser } = require("../../models/user.model");
const { saltAndHashPassword } = require("../../utils/encryption.util");
const { createAndSendJwt } = require("../../utils/jwt.util");
const transactions = require("../../utils/transaction.util");
const { createSafeUpdateObject } = require("../../utils/user.util");

async function registerUser(req, res, next) {
  const ex = validateUser(req.body, true);
  if (ex.error)
    return next({ status: 400, message: ex.error.details[0].message });

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser)
    return next({
      status: 400,
      message: "This email address is already registered",
    });

  const password = await saltAndHashPassword(req.body.password);
  const authId = new mongoose.Types.ObjectId();

  const queries = {
    auth: {
      collection: "auths",
      query: "insertOne",
      data: {
        _id: authId,
        password,
        loginCode: null,
      },
    },
    user: {
      collection: "users",
      query: "insertOne",
      data: {
        name: req.body.name,
        email: req.body.email,
        authId,
      },
    },
  };

  transactions.executeTransactionAndReturn(
    queries,
    "Account was not created.",
    res,
    next,
    null,
    (results) => createAndSendJwt(res, next, null, results.user.insertedId)
  );
}

async function refreshUserInfo(req, res, next) {
  createAndSendJwt(res, next, req.user);
}

async function deleteUser(req, res, next) {
  const queries = {
    user: {
      collection: "users",
      query: "deleteOne",
      data: { _id: req.user._id },
    },
    auth: {
      collection: "auths",
      query: "deleteOne",
      data: { _id: req.user.authId },
    },
  };

  transactions.executeTransactionAndReturn(
    queries,
    "Account was not deleted.",
    res,
    next
  );
}

async function updateUser(req, res, next) {
  const ex = validateUser(req.body, false);
  if (ex.error)
    return next({ status: 400, message: ex.error.details[0].message });

  const safeUpdateObject = createSafeUpdateObject(req.body);

  await User.updateOne({ _id: req.user._id }, { $set: safeUpdateObject });

  createAndSendJwt(res, next, null, req.user._id);
}

module.exports = {
  registerUser,
  refreshUserInfo,
  deleteUser,
  updateUser,
};
