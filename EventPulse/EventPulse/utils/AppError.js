/**
 * Custom operational error class.
 * Any error thrown with AppError is treated as an expected/handled error
 * by the central error middleware, as opposed to an unexpected bug.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
