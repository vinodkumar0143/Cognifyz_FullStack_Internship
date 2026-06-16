const rateLimit = require('express-rate-limit');

// Rate limiting for authentication routes (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit to 50 requests per IP per 15 mins
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false // Disable the X-RateLimit-* headers
});

// Rate limiting for weather search and history API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit to 100 searches/history commands per IP per 15 mins
    message: {
        success: false,
        message: 'API rate limit reached. Please wait 15 minutes before submitting more requests.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    authLimiter,
    apiLimiter
};
