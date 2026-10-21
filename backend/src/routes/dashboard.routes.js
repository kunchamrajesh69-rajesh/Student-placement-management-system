const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getStudentDashboard
} = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/admin', authorizeRoles('admin'), getAdminDashboard);
router.get('/student', authorizeRoles('student'), getStudentDashboard);

module.exports = router;
