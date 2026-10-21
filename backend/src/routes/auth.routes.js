const express = require('express');
const router = express.Router();
const { login, logout, getMe, changePassword } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const { loginValidator, changePasswordValidator } = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePasswordValidator, changePassword);

module.exports = router;
