const throng = require("throng");

const WORKERS = process.env.WEB_CONCURRENCY || 1;
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "test")
  throng({
    workers: WORKERS,
    lifetime: Infinity,
    start,
  });
else {
  console.log("Testing in progress...");
  start("single");
}

function start(workerId) {
  let server;
  try {
    require("./startup/env.startup")();
  } catch (error) {
    console.error(error);
  }
  const express = require("express");
  const app = express();

  app.use(require("./startup/logging.startup")());
  app.use(require("./startup/routes.startup"));

  require("./startup/mongoDb.startup")(workerId);
  require("./startup/redisClient.startup").connect();

  if (process.env.NODE_ENV === "production") {
    app.use(require("./startup/prod.startup"));
  }

  if (process.env.NODE_ENV !== "test") {
    server = app.listen(PORT, () => {
      console.log(
        "info",
        `Worker:${workerId} Running in ${process.env.NODE_ENV} environment`
      );
      console.log("info", `Worker:${workerId} Listening on port ${PORT}...`);
    });
  } else server = app.listen();
  module.exports = server;
}

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
  process.on(signal, async function () {
    console.error(signal + " occurred");
    process.exit();
  });
});
