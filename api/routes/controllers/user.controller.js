const { User } = require("../../models/user.model");
const { createAndSendJwt } = require("../../utils/jwt.util");
const transactions = require("../../utils/transaction.util");
const { validateAccountUpdate } = require("../../utils/user.util");
const { Account } = require("../../models/account.model");

async function refreshUserInfo(req, res, next) {
  createAndSendJwt(res, next, req.user, req.user._id);
}

async function getUserAccounts(req, res, next) {
  const allUsers = await User.find({ accountId: req.user.accountId });
  res.json(allUsers);
}

async function deleteUser(req, res, next) {
  const queries = {
    user: {
      collection: "users",
      query: "deleteOne",
      data: { _id: req.user._id },
    },
  };

  const remainingAccounts = await User.find({
    accountId: req.user.accountId._id,
    _id: { $ne: req.user._id },
  });
  if (!remainingAccounts.length) {
    queries.auth = {
      collection: "auths",
      query: "deleteOne",
      data: { _id: req.user.accountId.authId._id },
    };
    queries.account = {
      collection: "accounts",
      query: "deleteOne",
      data: { _id: req.user.accountId._id },
    };
  }

  transactions.executeTransactionAndReturn(
    queries,
    "Account was not deleted.",
    res,
    next
  );
}

async function updateUser(req, res, next) {
  const ex = validateAccountUpdate(req.safeUpdateObject);
  if (ex.error)
    return next({ status: 400, message: ex.error.details[0].message });

  // name is repeated across collections for ease of querying
  // must update in both places
  const queries = {
    account: {
      collection: "accounts",
      query: "updateOne",
      data: {
        filter: { _id: req.user.accountId._id },
        update: { $set: req.safeUpdateObject },
      },
    },
    user: {
      collection: "users",
      query: "updateMany",
      data: {
        filter: { _id: req.user._id },
        update: { $set: { name: req.safeUpdateObject.name } },
      },
    },
  };

  transactions.executeTransactionAndReturn(
    queries,
    "Account was not deleted.",
    res,
    next,
    null,
    () => createAndSendJwt(res, next, null, req.user._id)
  );
}

module.exports = {
  refreshUserInfo,
  getUserAccounts,
  deleteUser,
  updateUser,
};
