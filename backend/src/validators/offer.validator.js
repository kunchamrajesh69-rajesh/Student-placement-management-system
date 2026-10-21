const { body } = require('express-validator');
const validate = require('./validate');

const createOfferValidator = [
  body('applicationId').isMongoId().withMessage('Valid Application ID is required'),
  body('designation').notEmpty().withMessage('Designation / job role is required').trim(),
  body('packageLPA').isFloat({ min: 0.1 }).withMessage('Package in LPA must be a positive number'),
  validate
];

const updateOfferStatusValidator = [
  body('status')
    .isIn(['Offered', 'Accepted', 'Declined', 'Joined'])
    .withMessage('Invalid offer status'),
  validate
];

module.exports = {
  createOfferValidator,
  updateOfferStatusValidator
};
