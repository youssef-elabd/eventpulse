const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { registerForEvent } = require('../controllers/registrationController');
const {
  broadcastAnnouncement,
  getAnnouncements,
} = require('../controllers/announcementController');
const { createEventRules, updateEventRules } = require('../validators/eventValidators');
const { eventIdParamRule, announcementRules } = require('../validators/registrationValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.get('/', getEvents);
router.post('/', requireAuth, requireRole('admin'), createEventRules, validate, createEvent);

router.get('/:id', getEvent);
router.patch('/:id', requireAuth, requireRole('admin'), updateEventRules, validate, updateEvent);
router.delete('/:id', requireAuth, requireRole('admin'), deleteEvent);

router.post('/:eventId/register', requireAuth, eventIdParamRule, validate, registerForEvent);

router.get('/:eventId/announcements', requireAuth, eventIdParamRule, validate, getAnnouncements);
router.post(
  '/:eventId/announcements',
  requireAuth,
  requireRole('admin'),
  announcementRules,
  validate,
  broadcastAnnouncement
);

module.exports = router;
