const redis = require("redis");

let client;

client = redis.createClient({ url: process.env.REDIS_URL });
client.on("error", (err) => console.error("ERR:REDIS:", err));
client.on("connect", () => {
  console.log("Connected to Redis");
});

module.exports = client;
