const { validationResult } = require('express-validator');

/**
 * Middleware that checks for validation errors from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data supplied',
        details: errorDetails
      }
    });
  }
  next();
};

module.exports = validate;
