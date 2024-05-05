const allowedUpdateFields = ["name"];

function createSafeUpdateObject(update) {
  let safeUpdateObject = {};
  Object.keys(update).forEach((key) => {
    if (allowedUpdateFields.includes(key)) {
      safeUpdateObject[key] = update[key];
    }
  });
  return safeUpdateObject;
}

module.exports = {
  createSafeUpdateObject,
};
