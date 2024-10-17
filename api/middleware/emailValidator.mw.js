/**
 * validate if the request body contains the 'email' property, and if so trim whitespace and transform to lower case
 * @param {*} mustExist is the email required to exist on the request body
 * @returns error or passes to next middleware
 */
module.exports = function (mustExist, containedInObject, containedInParam) {
  return (req, res, next) => {
    let email = containedInParam
      ? req.params[containedInParam]
      : containedInObject
      ? req.body[containedInObject]
        ? req.body[containedInObject]?.email
        : null
      : req.body.email;

    if (!email) {
      if (mustExist) return next({ status: 400, message: "Email is required" });
      else next();
    } else {
      email = email.toLowerCase().trim();
      if (containedInParam) req.params[containedInParam] = email;
      else if (containedInObject) req.body[containedInObject].email = email;
      else req.body.email = email;
      next();
    }
  };
};
