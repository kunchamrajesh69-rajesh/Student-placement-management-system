const Department = require('../models/Department');

/**
 * @desc    Get all active departments
 * @route   GET /api/v1/departments
 * @access  Authenticated
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ code: 1 });
    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create department
 * @route   POST /api/v1/departments
 * @access  Admin
 */
const createDepartment = async (req, res, next) => {
  try {
    const { code, name, description } = req.body;

    const existing = await Department.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_DEPARTMENT',
          message: `Department with code ${code} already exists.`
        }
      });
    }

    const department = await Department.create({
      code: code.toUpperCase(),
      name,
      description
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department
 * @route   PATCH /api/v1/departments/:id
 * @access  Admin
 */
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Department not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete / deactivate department
 * @route   DELETE /api/v1/departments/:id
 * @access  Admin
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Department not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
