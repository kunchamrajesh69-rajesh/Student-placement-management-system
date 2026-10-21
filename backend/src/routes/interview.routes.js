const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterview
} = require('../controllers/interview.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const {
  scheduleInterviewValidator,
  updateInterviewValidator
} = require('../validators/interview.validator');

router.use(authenticate);

router.get('/', getInterviews);
router.post('/', authorizeRoles('admin'), scheduleInterviewValidator, scheduleInterview);
router.get('/:id', getInterviewById);
router.patch('/:id', authorizeRoles('admin'), updateInterviewValidator, updateInterview);

module.exports = router;
