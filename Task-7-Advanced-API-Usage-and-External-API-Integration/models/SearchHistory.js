const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: {
        type: String,
        required: true,
        trim: true
    },
    weatherData: {
        temp: Number,
        description: String,
        humidity: Number,
        windSpeed: Number,
        icon: String,
        country: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index to quickly fetch user's history ordered by most recent
SearchHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
