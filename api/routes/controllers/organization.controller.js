const mongoose = require("mongoose");
const { Account } = require("../../models/account.model");
const { comparePassword } = require("../../utils/encryption.util");
const {
  genericLoginError,
  createNewUserTransaction,
  validateNewUser,
} = require("../../utils/user.util");
const {
  validateOrganization,
  Organization,
} = require("../../models/organization.model");
const { validatePassword } = require("../../models/auth.model");
const { createAndSendJwt } = require("../../utils/jwt.util");
const transactions = require("../../utils/transaction.util");

async function createNewOrg(req, res, next) {
  const existingAccount = await Account.findOne({
    email: req.body.user.email,
  }).populate("authId");
  if (existingAccount) {
    const passwordMatch = await comparePassword(
      existingAccount,
      req.body.user.password
    );
    if (!passwordMatch)
      return next({ status: 400, message: genericLoginError });
  }

  const existingOrg = await Organization.findOne({
    name: req.body.organization.name,
  });
  if (existingOrg)
    return next({ status: 400, message: "Organization name is in use" });

  // validations
  const orgEx = validateOrganization(req.body.organization);
  if (orgEx.error)
    return next({ status: 400, message: orgEx.error.details[0].message });

  const pwValidationFail = validatePassword(req.body.user.password);
  if (pwValidationFail.error)
    return next({ status: 400, message: pwValidationFail.error.message });

  req.body.user.role = "owner";
  const userEx = validateNewUser(req.body.user);
  if (userEx.error)
    return next({ status: 400, message: userEx.error.details[0].message });
  // end validations

  const queries = {};
  const organizationId = new mongoose.Types.ObjectId();
  req.body.user.organizationId = organizationId;
  await createNewUserTransaction(req.body.user, existingAccount, queries);

  queries.organization = {
    collection: "organizations",
    query: "insertOne",
    data: {
      _id: organizationId,
      ownerId: queries.user.data._id,
      name: req.body.organization.name,
    },
  };

  transactions.executeTransactionAndReturn(
    queries,
    "Organization was not created.",
    res,
    next,
    null,
    (results) => createAndSendJwt(res, next, null, results.user.insertedId)
  );
}

async function updateOrg(req, res, next) {
  const orgEx = validateOrganization(req.safeUpdateObject);
  if (orgEx.error)
    return next({ status: 400, message: orgEx.error.details[0].message });

  await Organization.updateOne(
    { _id: req.user.organizationId },
    { $set: req.safeUpdateObject }
  );

  createAndSendJwt(res, next, null, req.user._id);
}

async function deleteOrg(req, res, next) {
  const queries = {};
  // mark all related documents for deletion
  const deleted = new Date();
  ["organizations", "projects", "structures", "users"].forEach((collection) => {
    const filter =
      collection === "organizations"
        ? {
            _id: req.org._id,
          }
        : { organizationId: req.org._id };
    queries[collection] = {
      collection,
      query: "updateMany",
      data: {
        filter,
        update: { $set: { deleted } },
      },
    };
  });

  transactions.executeTransactionAndReturn(
    queries,
    "Organization was not deleted.",
    res,
    next
  );
}

async function getOrg(req, res, next) {
  res.json(req.org);
}

module.exports = {
  createNewOrg,
  updateOrg,
  deleteOrg,
  getOrg,
};
