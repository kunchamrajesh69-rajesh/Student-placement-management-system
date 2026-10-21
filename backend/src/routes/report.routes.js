const express = require('express');
const router = express.Router();
const {
  getPlacementReport,
  exportPlacementCSV
} = require('../controllers/report.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/placements', getPlacementReport);
router.get('/placements/export-csv', exportPlacementCSV);

module.exports = router;
