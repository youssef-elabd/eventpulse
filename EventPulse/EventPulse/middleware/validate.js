const { validationResult } = require('express-validator');

/**
 * Runs after an express-validator rule chain. If any rule failed,
 * responds with a structured 422 listing every invalid field.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'fail',
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
