const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const departmentRoutes = require('./department.routes');
const companyRoutes = require('./company.routes');
const jobDriveRoutes = require('./jobDrive.routes');
const applicationRoutes = require('./application.routes');
const interviewRoutes = require('./interview.routes');
const offerRoutes = require('./offer.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Student Placement Management System API',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/departments', departmentRoutes);
router.use('/companies', companyRoutes);
router.use('/placement-drives', jobDriveRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/offers', offerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
