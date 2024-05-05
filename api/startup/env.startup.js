module.exports = function () {
  if (process.env.NODE_ENV !== "test") {
    const envVars = ["MONGO_URL", "JWT_KEY", "REDIS_URL"];
    envVars.forEach((envVar) => {
      if (!process.env[envVar])
        throw new Error(`Environment variable ${envVar} not set`);
    });
  }
};
