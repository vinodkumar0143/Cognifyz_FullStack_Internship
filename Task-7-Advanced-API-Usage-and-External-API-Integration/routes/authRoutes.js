const express = require('express');
const router = express.Router();

const { register, login, getProfile } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { protect } = require('../middleware/authMiddleware');

// User Registration Route - with input validation and rate limiter
router.post('/register', authLimiter, validateRegister, register);

// User Login Route - with input validation and rate limiter
router.post('/login', authLimiter, validateLogin, login);

// Get authenticated user profile details - JWT protected
router.get('/profile', protect, getProfile);

module.exports = router;
