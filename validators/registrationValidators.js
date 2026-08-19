const { param, body } = require('express-validator');

const eventIdParamRule = [param('eventId').isMongoId().withMessage('A valid event id is required')];

const announcementRules = [
  param('eventId').isMongoId().withMessage('A valid event id is required'),
  body('text').trim().notEmpty().withMessage('Announcement text is required'),
];

module.exports = { eventIdParamRule, announcementRules };
