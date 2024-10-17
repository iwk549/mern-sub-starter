const Joi = require("joi");

const nameSchema = {
  mongo: { type: String, required: true, min: 3, max: 99 },
  joi: Joi.string().required().min(3).max(99),
};

const deletedSchema = {
  mongo: { type: Date, required: false },
  joi: Joi.date().optional(),
  filterFor: {
    $and: [{ deleted: { $exists: true } }, { deleted: { $ne: null } }],
  },
  filterOut: { $or: [{ deleted: { $exists: false } }, { deleted: null }] },
};

/**
 * extract a filter object from the request
  use query params to get filter for deleted items and for owner
  include filter for user's org
 * @param {Request} req request object
 * @param {string} ownerIdProp schema property to compare to the user id
 * @returns mongoose filter object
 */
function extractFilterFromRequest(req, ownerIdProp = "ownerId") {
  const deletedFilter = req.query.deleted
    ? req.query.deleted === "include"
      ? {}
      : deletedSchema.filterFor
    : deletedSchema.filterOut;

  const ownerFilter =
    ownerIdProp && req.user.role !== "owner" && !req.query.all
      ? { [ownerIdProp]: req.user._id }
      : {};

  return {
    ...deletedFilter,
    ...ownerFilter,
    organizationId: req.user.organizationId,
  };
}

module.exports = {
  nameSchema,
  deletedSchema,
  extractFilterFromRequest,
};
