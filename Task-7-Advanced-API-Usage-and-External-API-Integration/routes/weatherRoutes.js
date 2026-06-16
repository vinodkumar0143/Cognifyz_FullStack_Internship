const express = require('express');
const router = express.Router();

const { 
    getWeather, 
    getHistory, 
    deleteHistoryItem, 
    clearHistory 
} = require('../controllers/weatherController');

const { protect } = require('../middleware/authMiddleware');
const { validateSearch } = require('../middleware/validationMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// All weather and search history routes require JWT authentication and rate limiting
router.use(protect);
router.use(apiLimiter);

// 1. GET /api/weather/search?city=cityName - Search weather details
router.get('/search', validateSearch, getWeather);

// 2. GET /api/weather/history - Get search history logs
router.get('/history', getHistory);

// 3. DELETE /api/weather/history - Clear all search logs
router.delete('/history', clearHistory);

// 4. DELETE /api/weather/history/:id - Delete a specific search log entry
router.delete('/history/:id', deleteHistoryItem);

module.exports = router;
