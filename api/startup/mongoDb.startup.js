const mongoose = require("mongoose");

module.exports = function (workerId) {
  let db;
  if (process.env.NODE_ENV !== "test")
    db = process.env.MONGO_URL || "mongodb://localhost/mern";
  else db = "mongodb://localhost/mern_tests";

  mongoose
    .connect(db)
    .then(() =>
      console.log(
        `Worker:${workerId} Connected to ${
          process.env.NODE_ENV !== "production" ? db : "database"
        }...`
      )
    );
};
