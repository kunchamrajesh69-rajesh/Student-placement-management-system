const PlacementReportService = require('../services/placement-report.service');

/**
 * @desc    Get Admin Dashboard metrics
 * @route   GET /api/v1/dashboard/admin
 * @access  Admin
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await PlacementReportService.getAdminDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Student Dashboard metrics
 * @route   GET /api/v1/dashboard/student
 * @access  Student
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    if (!req.user.studentProfile) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PROFILE', message: 'No student profile associated with this account' }
      });
    }

    const studentStats = await PlacementReportService.getStudentDashboardStats(req.user.studentProfile);
    return res.status(200).json({
      success: true,
      data: studentStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard
};
