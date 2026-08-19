const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/register', registerRules, validate, register);

router.post('/login', loginRules, validate, login);

router.get('/me', requireAuth, getMe);

module.exports = router;
