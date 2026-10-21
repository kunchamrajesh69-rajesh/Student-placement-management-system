const { body } = require('express-validator');
const validate = require('./validate');

const createApplicationValidator = [
  body('jobDriveId').isMongoId().withMessage('Valid Job Drive ID is required'),
  validate
];

const updateStageValidator = [
  body('stage')
    .isIn([
      'Applied',
      'Shortlisted',
      'Assessment',
      'Interview',
      'Selected',
      'Rejected',
      'Offered',
      'Joined'
    ])
    .withMessage('Invalid selection stage supplied'),
  body('remarks').optional().trim(),
  validate
];

module.exports = {
  createApplicationValidator,
  updateStageValidator
};
