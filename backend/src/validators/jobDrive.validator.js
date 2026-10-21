const { body } = require('express-validator');
const validate = require('./validate');

const createJobDriveValidator = [
  body('title').notEmpty().withMessage('Job title is required').trim(),
  body('company').isMongoId().withMessage('Valid company ID is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('location').notEmpty().withMessage('Job location is required').trim(),
  body('salaryPackage.ctcLpa').isFloat({ min: 0 }).withMessage('CTC in LPA is required and must be non-negative'),
  body('applicationDeadline').isISO8601().withMessage('Application deadline must be a valid date'),
  body('eligibilityCriteria.minCgpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Minimum CGPA must be between 0 and 10'),
  body('eligibilityCriteria.maxBacklogs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum backlogs must be non-negative integer'),
  validate
];

const updateJobDriveValidator = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('applicationDeadline').optional().isISO8601().withMessage('Deadline must be a valid date'),
  body('status').optional().isIn(['Draft', 'Active', 'Closed', 'Completed']).withMessage('Invalid status'),
  validate
];

module.exports = {
  createJobDriveValidator,
  updateJobDriveValidator
};
