const PlacementReportService = require('../services/placement-report.service');

/**
 * @desc    Get detailed placement analytics report
 * @route   GET /api/v1/reports/placements
 * @access  Admin
 */
const getPlacementReport = async (req, res, next) => {
  try {
    const report = await PlacementReportService.getAdminDashboardStats();
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export placement data as downloadable CSV
 * @route   GET /api/v1/reports/placements/export-csv
 * @access  Admin
 */
const exportPlacementCSV = async (req, res, next) => {
  try {
    const csvData = await PlacementReportService.generatePlacementReportCSV();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `placement-report-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlacementReport,
  exportPlacementCSV
};
