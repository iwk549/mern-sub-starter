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

module.exports = {
  nameSchema,
  deletedSchema,
};
