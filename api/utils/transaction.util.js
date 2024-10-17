const mongoose = require("mongoose");

const dbConnect = async () => {
  return mongoose
    .createConnection(
      process.env.NODE_ENV !== "test"
        ? process.env.MONGO_URL
        : "mongodb://localhost/mern_tests"
    )
    .asPromise();
};

const transactions = {};

/**
 *
 * @param {*} queries object {
 *  collection: string
 *  query: string
 *  data: filter object | document | {
 *    filter: filter object
 *    update: update object
 *    arrayFilters: optional filter object for array
 *  }
 * }
 * @param {*} errorText test to supply as error message if transaction fails
 * @param {*} res response object from original request
 * @param {*} next function from original request
 * @param {*} onSuccessCallback callback to execute if transaction succeeds, before sending response
 * @param {*} customReturnCallback callback to execute in place of generic response
 * @returns
 */
transactions.executeTransactionAndReturn = async (
  queries,
  errorText,
  res,
  next,
  onSuccessCallback,
  customReturnCallback
) => {
  const db = await dbConnect();
  const session = await db.startSession();
  session.startTransaction();

  try {
    const options = { session, returnOriginal: false };
    let results = {};

    for (let property in queries) {
      let thisQ = queries[property];
      if (thisQ.data.arrayFilters) {
        options.arrayFilters = thisQ.data.arrayFilters;
        options.multi = true;
      }
      let result;

      if (thisQ.query.includes("update")) {
        result = await db
          .collection(thisQ.collection)
          [thisQ.query](thisQ.data.filter, thisQ.data.update, options);
      } else
        result = await db
          .collection(thisQ.collection)
          [thisQ.query](thisQ.data, options);

      results[property] = result;
    }

    await session.commitTransaction();
    session.endSession();
    db.close();

    if (onSuccessCallback) await onSuccessCallback();

    if (customReturnCallback) return customReturnCallback(results);
    else return res.json(results);
  } catch (ex) {
    await session.abortTransaction();
    session.endSession();
    db.close();
    return next({
      status: 400,
      message: "Something went wrong. " + errorText + " Please try again.",
    });
  }
};

module.exports = transactions;
