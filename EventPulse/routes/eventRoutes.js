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

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: List events (filter, paginate, sort, search)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [date, -date, popularity] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of events
 *   post:
 *     summary: Create an event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getEvents);
router.post('/', requireAuth, requireRole('admin'), createEventRules, validate, createEvent);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event
 *     tags: [Events]
 *   patch:
 *     summary: Update an event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete an event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', getEvent);
router.patch('/:id', requireAuth, requireRole('admin'), updateEventRules, validate, updateEvent);
router.delete('/:id', requireAuth, requireRole('admin'), deleteEvent);

/**
 * @openapi
 * /api/events/{eventId}/register:
 *   post:
 *     summary: Register the authenticated user for an event
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Registered
 *       409:
 *         description: Already registered or event full
 */
router.post('/:eventId/register', requireAuth, eventIdParamRule, validate, registerForEvent);

/**
 * @openapi
 * /api/events/{eventId}/announcements:
 *   get:
 *     summary: Get the announcement history of an event
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Broadcast a live announcement (admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 */
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
