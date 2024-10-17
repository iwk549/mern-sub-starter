const allowedUpdateFields = {
  account: ["name"],
  organization: ["name"],
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

module.exports = {
  createSafeUpdateObject,
};
