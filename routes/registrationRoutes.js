const express = require('express');
const { getMyRegistrations, cancelRegistration } = require('../controllers/registrationController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/me', requireAuth, getMyRegistrations);

router.delete('/:id', requireAuth, cancelRegistration);

module.exports = router;
