const { body } = require('express-validator');
const validate = require('./validate');

const createStudentValidator = [
  body('rollNumber')
    .notEmpty()
    .withMessage('Roll number is required')
    .trim(),
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Initial password must be at least 6 characters'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('department')
    .isMongoId()
    .withMessage('Valid department ID is required'),
  body('batch')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Graduation batch must be a valid 4-digit year'),
  body('cgpa')
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be a decimal between 0 and 10'),
  body('activeBacklogs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Active backlogs must be non-negative integer'),
  validate
];

const updateStudentValidator = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('cgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('activeBacklogs').optional().isInt({ min: 0 }).withMessage('Active backlogs must be non-negative'),
  body('resumeUrl').optional().trim().isURL().withMessage('Resume URL must be a valid web link'),
  validate
];

module.exports = {
  createStudentValidator,
  updateStudentValidator
};
