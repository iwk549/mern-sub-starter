const { default: mongoose } = require("mongoose");

const organizationId = new mongoose.Types.ObjectId();
const accountId = new mongoose.Types.ObjectId();
const authId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();

const user = {
  accountId,
  role: "admin",
  organizationId,
};

const account = {
  _id: accountId,
  authId,
  name: "Test One",
  email: "test1@test.com",
};

const organization = {
  name: "Test Org",
  ownerId: userId,
};

module.exports = {
  organizationId,
  authId,
  accountId,
  userId,
  user,
  account,
  organization,
};
