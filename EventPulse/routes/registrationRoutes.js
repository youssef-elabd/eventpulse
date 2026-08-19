const express = require('express');
const { getMyRegistrations, cancelRegistration } = require('../controllers/registrationController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

/**
 * @openapi
 * /api/registrations/me:
 *   get:
 *     summary: Get the authenticated user's registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', requireAuth, getMyRegistrations);

/**
 * @openapi
 * /api/registrations/{id}:
 *   delete:
 *     summary: Cancel a registration
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireAuth, cancelRegistration);

module.exports = router;
