const redis = require("../startup/redisClient.startup");

function createSessionKey(user) {
  return `${process.env.NODE_ENV}:session:${user._id}`;
}

async function getUserSession(user) {
  return redis.get(createSessionKey(user));
}

async function createUserSession(user) {
  const sessionId = new Date().getTime();
  await redis.set(createSessionKey(user), sessionId);
  return sessionId;
}

async function deleteUserSession(user) {
  return redis.del(createSessionKey(user));
}

module.exports = {
  getUserSession,
  createUserSession,
  deleteUserSession,
};
