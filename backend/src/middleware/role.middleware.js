/**
 * Role-Based Access Control (RBAC) Middleware
 */

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required.'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `User role '${req.user.role}' is not authorized to access this resource.`
        }
      });
    }

    next();
  };
};

/**
 * Checks if a student is accessing their own profile/records.
 * If user is admin, allow access automatically.
 */
const checkStudentOwnership = (paramKey = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const targetStudentId = req.params[paramKey] || req.body.studentId;
    const currentStudentProfileId = req.user.studentProfile?._id?.toString() || req.user.studentProfile?.toString();

    if (!currentStudentProfileId || currentStudentProfileId !== targetStudentId?.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are only authorized to access and modify your own student profile.'
        }
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
  checkStudentOwnership
};
