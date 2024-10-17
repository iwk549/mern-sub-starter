const mongoose = require("mongoose");

const allowedUpdateFields = {
  account: ["name"],
  organization: ["name"],
  project: ["name"],
  structure: ["name", "values"],
};

function createSafeUpdateObject(model) {
  return (req, res, next) => {
    if (!allowedUpdateFields[model]) throw new Error("Invalid model provided");
    let safeUpdateObject = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdateFields[model].includes(key)) {
        safeUpdateObject[key] = req.body[key];
      }
    });
    req.safeUpdateObject = safeUpdateObject;

    next();
  };
}

function validateObjectId(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return next({ status: 400, message: "Invalid ID" });
  next();
}

module.exports = {
  createSafeUpdateObject,
  validateObjectId,
};
