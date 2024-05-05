const bcrypt = require("bcrypt");

async function saltAndHashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(user, password) {
  let comp = false;
  try {
    comp = await bcrypt.compare(password, user?.authId?.password);
  } catch (error) {}
  return comp;
}

module.exports = {
  saltAndHashPassword,
  comparePassword,
};
