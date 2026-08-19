const AppError = require('../utils/AppError');

/**
 * 404 handler for unmatched routes.
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

/**
 * Central error-handling middleware. Every error thrown or passed to
 * next() anywhere in the app ends up here.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new AppError(`Duplicate value for field: ${field}`, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError(messages.join('. '), 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Something went wrong on the server.';

  if (!error.isOperational) {
    // Log unexpected errors for debugging without leaking internals to the client
    console.error('[UNEXPECTED ERROR]', err);
  }

  res.status(statusCode).json({
    status: error.status || 'error',
    message,
  });
};

module.exports = { notFound, errorHandler };
