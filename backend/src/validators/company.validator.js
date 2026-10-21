const { body } = require('express-validator');
const validate = require('./validate');

const createCompanyValidator = [
  body('name').notEmpty().withMessage('Company name is required').trim(),
  body('industry').notEmpty().withMessage('Industry is required').trim(),
  body('website').optional().trim(),
  body('hrContacts').optional().isArray().withMessage('HR contacts must be an array'),
  body('hrContacts.*.name').optional().notEmpty().withMessage('HR contact name is required'),
  body('hrContacts.*.email').optional().isEmail().withMessage('HR contact email must be valid'),
  validate
];

const updateCompanyValidator = [
  body('name').optional().notEmpty().withMessage('Company name cannot be empty').trim(),
  body('industry').optional().notEmpty().withMessage('Industry cannot be empty').trim(),
  body('status').optional().isIn(['Active', 'Inactive', 'Blacklisted']).withMessage('Invalid status'),
  validate
];

module.exports = {
  createCompanyValidator,
  updateCompanyValidator
};
