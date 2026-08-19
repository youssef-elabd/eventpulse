/**
 * Wraps an async controller/middleware function and forwards any
 * rejected promise to Express's next(), so we never need try/catch
 * blocks inside controllers.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
