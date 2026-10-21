const Company = require('../models/Company');

/**
 * @desc    Get all companies (HR contacts sanitized for students)
 * @route   GET /api/v1/companies
 * @access  Authenticated
 */
const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, status } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (industry) query.industry = industry;
    if (status) query.status = status;

    let projection = {};
    // Restrict HR contact info for students
    if (req.user.role === 'student') {
      projection = { hrContacts: 0 };
    }

    const companies = await Company.find(query, projection).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single company
 * @route   GET /api/v1/companies/:id
 * @access  Authenticated
 */
const getCompanyById = async (req, res, next) => {
  try {
    let projection = {};
    if (req.user.role === 'student') {
      projection = { hrContacts: 0 };
    }

    const company = await Company.findById(req.params.id, projection);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company not found' }
      });
    }

    return res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create company
 * @route   POST /api/v1/companies
 * @access  Admin
 */
const createCompany = async (req, res, next) => {
  try {
    const existing = await Company.findOne({ name: req.body.name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_COMPANY', message: 'Company with this name already exists' }
      });
    }

    const company = await Company.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company
 * @route   PATCH /api/v1/companies/:id
 * @access  Admin
 */
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete company
 * @route   DELETE /api/v1/companies/:id
 * @access  Admin
 */
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};
