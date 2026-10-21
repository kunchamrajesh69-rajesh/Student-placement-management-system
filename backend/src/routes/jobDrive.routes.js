const express = require('express');
const router = express.Router();
const {
  getJobDrives,
  getJobDriveById,
  getDriveEligibility,
  createJobDrive,
  updateJobDrive,
  deleteJobDrive
} = require('../controllers/jobDrive.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const {
  createJobDriveValidator,
  updateJobDriveValidator
} = require('../validators/jobDrive.validator');

router.use(authenticate);

router.get('/', getJobDrives);
router.post('/', authorizeRoles('admin'), createJobDriveValidator, createJobDrive);
router.get('/:id', getJobDriveById);
router.patch('/:id', authorizeRoles('admin'), updateJobDriveValidator, updateJobDrive);
router.delete('/:id', authorizeRoles('admin'), deleteJobDrive);
router.get('/:id/eligibility', getDriveEligibility);

module.exports = router;
