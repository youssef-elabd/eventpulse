const { body } = require('express-validator');

const createEventRules = [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('description').trim().notEmpty().withMessage('Event description is required'),
  body('category').isMongoId().withMessage('A valid category id is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('date').isISO8601().toDate().withMessage('A valid date is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

const updateEventRules = [
  body('name').optional().trim().notEmpty().withMessage('Event name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isMongoId().withMessage('A valid category id is required'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('date').optional().isISO8601().toDate().withMessage('A valid date is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

module.exports = { createEventRules, updateEventRules };
