const SearchHistory = require('../models/SearchHistory');
const weatherService = require('../utils/weatherService');

/**
 * @desc    Get weather details by city and record history
 * @route   GET /api/weather/search
 * @access  Private (JWT Protected)
 */
const getWeather = async (req, res, next) => {
    const { city } = req.query;

    try {
        // Fetch weather from OpenWeatherMap or Mock Fallback
        const weatherData = await weatherService.fetchWeather(city);

        // Record search logs in MongoDB
        const history = new SearchHistory({
            userId: req.user._id,
            query: city.trim(),
            weatherData: {
                temp: weatherData.temp,
                description: weatherData.description,
                humidity: weatherData.humidity,
                windSpeed: weatherData.windSpeed,
                icon: weatherData.icon,
                country: weatherData.country
            }
        });

        await history.save();

        res.status(200).json({
            success: true,
            weather: weatherData,
            searchLogId: history._id
        });
    } catch (error) {
        // Forward errors (like City Not Found) to error middleware
        if (error.message.includes('not found')) {
            res.status(404);
        }
        next(error);
    }
};

/**
 * @desc    Get search history for the authenticated user
 * @route   GET /api/weather/history
 * @access  Private (JWT Protected)
 */
const getHistory = async (req, res, next) => {
    try {
        const historyList = await SearchHistory.find({ userId: req.user._id })
            .sort({ timestamp: -1 }); // Newest searches first

        res.status(200).json({
            success: true,
            count: historyList.length,
            history: historyList
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a specific search history entry
 * @route   DELETE /api/weather/history/:id
 * @access  Private (JWT Protected)
 */
const deleteHistoryItem = async (req, res, next) => {
    const historyId = req.params.id;

    try {
        const historyItem = await SearchHistory.findById(historyId);

        if (!historyItem) {
            res.status(404);
            throw new Error('Search history entry not found.');
        }

        // Security check: Verify ownership
        if (historyItem.userId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to manage this search history entry.');
        }

        await SearchHistory.findByIdAndDelete(historyId);

        res.status(200).json({
            success: true,
            message: 'Search history entry removed.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear all search history entries for the authenticated user
 * @route   DELETE /api/weather/history
 * @access  Private (JWT Protected)
 */
const clearHistory = async (req, res, next) => {
    try {
        const result = await SearchHistory.deleteMany({ userId: req.user._id });

        res.status(200).json({
            success: true,
            message: `Cleared search history list. Removed ${result.deletedCount} entries.`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWeather,
    getHistory,
    deleteHistoryItem,
    clearHistory
};
