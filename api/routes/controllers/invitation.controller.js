const mongoose = require("mongoose");
const { Invitation } = require("../../models/invitation.model");
const { User } = require("../../models/user.model");

async function inviteUser(req, res, next) {
  const existingAccount = await User.findOne({
    email: req.body.email,
    organizationId: req.user.organizationId,
  });
  if (existingAccount)
    return next({
      status: 400,
      message: "There is already a user in your organization with this email",
    });

  const invitation = new Invitation({
    email: req.body.email,
    organizationId: req.user.organizationId,
    code: String(new mongoose.Types.ObjectId()),
  });

  // TODO: hook in nodemailer and email the invitation
  await invitation.save();

  res.json("Invitation sent");
}

async function getInvitations(req, res) {
  const invitations = await Invitation.find({
    organizationId: req.user.organizationId,
  }).select("email");
  res.json(invitations);
}

async function deleteInvitation(req, res, next) {
  const invitation = await Invitation.findOneAndDelete({
    organizationId: req.user.organizationId,
    email: req.params.email,
  });

  if (!invitation)
    return next({ status: 404, message: "Invitation not found" });

  res.json("Invitation deleted");
}

module.exports = {
  getInvitations,
  inviteUser,
  deleteInvitation,
};
