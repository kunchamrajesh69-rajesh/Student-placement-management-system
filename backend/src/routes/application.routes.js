const express = require('express');
const router = express.Router();
const {
  applyForDrive,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStage
} = require('../controllers/application.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const {
  createApplicationValidator,
  updateStageValidator
} = require('../validators/application.validator');

router.use(authenticate);

router.get('/my-applications', authorizeRoles('student'), getMyApplications);
router.get('/', authorizeRoles('admin'), getApplications);
router.post('/', authorizeRoles('student'), createApplicationValidator, applyForDrive);
router.get('/:id', getApplicationById);
router.patch('/:id/stage', authorizeRoles('admin'), updateStageValidator, updateApplicationStage);

module.exports = router;
