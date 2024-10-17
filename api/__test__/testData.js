const { default: mongoose } = require("mongoose");

const organizationId = new mongoose.Types.ObjectId();
const accountId = new mongoose.Types.ObjectId();
const authId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();

const user = {
  accountId,
  role: "admin",
  email: "test1@test.com",
  organizationId,
};

const account = {
  _id: accountId,
  authId,
  name: "Test One",
  email: "test1@test.com",
};

const organization = {
  _id: organizationId,
  name: "Test Org",
  ownerId: userId,
};

const invitation = {
  email: "testinvitation@test.com",
  organizationId,
  code: String(new mongoose.Types.ObjectId()),
};

const project = {
  organizationId,
  name: "Test Project",
};

const structure = {
  organizationId,
  projectId: new mongoose.Types.ObjectId(),
  name: "Test Module",
  values: {},
};

module.exports = {
  organizationId,
  authId,
  accountId,
  userId,
  user,
  account,
  organization,
  invitation,
  project,
  structure,
};
