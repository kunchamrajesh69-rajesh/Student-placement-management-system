const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/company.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const {
  createCompanyValidator,
  updateCompanyValidator
} = require('../validators/company.validator');

router.use(authenticate);

router.get('/', getCompanies);
router.post('/', authorizeRoles('admin'), createCompanyValidator, createCompany);
router.get('/:id', getCompanyById);
router.patch('/:id', authorizeRoles('admin'), updateCompanyValidator, updateCompany);
router.delete('/:id', authorizeRoles('admin'), deleteCompany);

module.exports = router;
