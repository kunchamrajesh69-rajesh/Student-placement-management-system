const { body } = require('express-validator');
const validate = require('./validate');

const scheduleInterviewValidator = [
  body('applicationId').isMongoId().withMessage('Valid Application ID is required'),
  body('roundName').notEmpty().withMessage('Round name is required').trim(),
  body('interviewDate').isISO8601().withMessage('Interview date must be a valid date'),
  body('interviewTime').notEmpty().withMessage('Interview time is required').trim(),
  body('mode').isIn(['Online', 'Offline']).withMessage('Mode must be Online or Offline'),
  body('locationOrLink').notEmpty().withMessage('Location or Meeting link is required').trim(),
  validate
];

const updateInterviewValidator = [
  body('status').optional().isIn(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']).withMessage('Invalid status'),
  body('feedback.rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  validate
];

module.exports = {
  scheduleInterviewValidator,
  updateInterviewValidator
};
