/**
 * validate if the request body contains the 'email' property, and if so trim whitespace and transform to lower case
 * @param {*} mustExist is the email required to exist on the request body
 * @returns error or passes to next middleware
 */
module.exports = function (mustExist) {
  return (req, res, next) => {
    if (!req.body.email) {
      if (mustExist) return next({ status: 400, message: "Email is required" });
      else next();
    } else {
      let email = req.body.email;
      email = email.toLowerCase().trim();
      req.body.email = email;
      next();
    }
  };
};
