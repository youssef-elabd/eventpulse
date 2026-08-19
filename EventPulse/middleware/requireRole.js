const AppError = require('../utils/AppError');

/**
 * Restricts a route to one or more roles.
 * The role is always read from the authenticated JWT user (req.user),
 * never from the request body.
 * Usage: requireRole('admin')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated. Please log in.', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }

  next();
};

module.exports = requireRole;
