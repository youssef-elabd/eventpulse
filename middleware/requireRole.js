const AppError = require('../utils/AppError');

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
