// validators/taskSchema.js
const Joi = require('joi').extend(require('@joi/date'));

const schema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Task name is required',
      'string.min': 'Task name must be at least 1 character',
      'string.max': 'Task name must be at most 255 characters',
    }),
  description: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Task description is required',
      'string.min': 'Task description must be at least 1 character',
      'string.max': 'Task description must be at most 255 characters',
    }),
  // This can be constant to manage the statuses
  status: Joi.string()
    .valid('to-do', 'done')
    .default('to-do'),
  startDate: Joi.date().options({ convert: true }).optional()
    .messages({
      'date.iso': 'Start date must be a valid ISO 8601 date',
      'date.base': 'Start date must be a valid date',
    }),
  dueDate: Joi.date().options({ convert: true }).greater(Joi.ref('startDate')).optional()
    .messages({
      'date.iso': 'Start date must be a valid ISO 8601 date',
      'date.base': 'Start date must be a valid date',
    }),
  doneDate: Joi.date().options({ convert: true }).optional()
    .messages({
      'date.iso': 'Start date must be a valid ISO 8601 date',
      'date.base': 'Start date must be a valid date',
    })
})
.strict(); // Disallow any additional fields

const schemaUpdate = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Task name is required',
      'string.min': 'Task name must be at least 1 character',
      'string.max': 'Task name must be at most 255 characters',
    }),
  description: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Task description is required',
      'string.min': 'Task description must be at least 1 character',
      'string.max': 'Task description must be at most 255 characters',
    }),
  // This can be constant to manage the statuses
  status: Joi.forbidden(),
  /*Joi.string() // We might need to add/remove the option
    .valid('to-do', 'done')
    .optional(),*/
  startDate: Joi.date().options({ convert: true }).optional(),
  dueDate: Joi.date().options({ convert: true }).greater(Joi.ref('startDate')).optional(),
  doneDate: Joi.date().options({ convert: true }).optional()
})
.strict(); // Disallow any additional fields

module.exports = { schema, schemaUpdate };
