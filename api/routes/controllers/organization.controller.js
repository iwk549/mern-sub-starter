const mongoose = require("mongoose");
const { Account } = require("../../models/account.model");
const { comparePassword } = require("../../utils/encryption.util");
const {
  genericLoginError,
  createNewUserTransaction,
  validateNewUser,
} = require("../../utils/user.util");
const { validateOrganization } = require("../../models/organization.model");
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
    "Account was not created.",
    res,
    next,
    null,
    (results) => createAndSendJwt(res, next, null, results.user.insertedId)
  );
}

module.exports = {
  createNewOrg,
};
