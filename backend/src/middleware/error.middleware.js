/**
 * Centralized Error Handling Middleware
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error]: ${err.name} - ${err.message}`, err.stack);
  }

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message
      }
    });
  }

  // 2. Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    let message = `Duplicate value entered for ${duplicateField}. Must be unique.`;

    if (err.keyPattern && err.keyPattern.student && err.keyPattern.jobDrive) {
      message = 'You have already applied for this placement drive. Duplicate applications are not allowed.';
    }

    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message
      }
    });
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data supplied',
        details
      }
    });
  }

  // 4. Default Internal Server Error
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: error.message || 'Internal Server Error'
    }
  });
};

module.exports = errorHandler;
