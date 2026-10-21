const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/department.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', getDepartments);
router.post('/', authorizeRoles('admin'), createDepartment);
router.patch('/:id', authorizeRoles('admin'), updateDepartment);
router.delete('/:id', authorizeRoles('admin'), deleteDepartment);

module.exports = router;
