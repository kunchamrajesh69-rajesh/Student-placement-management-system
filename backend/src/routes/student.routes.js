const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/student.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const {
  createStudentValidator,
  updateStudentValidator
} = require('../validators/student.validator');

router.use(authenticate);

router.get('/', authorizeRoles('admin'), getStudents);
router.post('/', authorizeRoles('admin'), createStudentValidator, createStudent);
router.get('/:id', getStudentById);
router.patch('/:id', updateStudentValidator, updateStudent);
router.delete('/:id', authorizeRoles('admin'), deleteStudent);

module.exports = router;
