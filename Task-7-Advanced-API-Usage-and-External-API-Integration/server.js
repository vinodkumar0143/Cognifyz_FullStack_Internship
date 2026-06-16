require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, mongoose } = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Import Route definitions
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware Configurations
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static static resources from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Server Status endpoint - check DB state and Weather API key mode
app.get('/api/status', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };
    
    const weatherKey = process.env.WEATHER_API_KEY;
    const isMock = !weatherKey || weatherKey === 'your_openweathermap_api_key_here' || weatherKey.trim() === '';

    res.json({
        success: true,
        database: {
            state: dbState,
            status: states[dbState] || 'Unknown'
        },
        weatherApiMode: isMock ? 'Mock Fallback Mode (Configurable in .env)' : 'Active OpenWeatherMap API Mode'
    });
});

// Mounting Routing endpoints
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

// Wildcard fallback to static client index page for client-side routing consistency
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Hook global error handler middleware (Must be after routing mounts)
app.use(errorHandler);

// Listen on designated port
app.listen(PORT, () => {
    console.log(`Task 7 Application Server listening at http://localhost:${PORT}`);
    console.log(`OpenWeatherMap Integration Mode: ${
        (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === 'your_openweathermap_api_key_here')
        ? 'MOCK (No active key in .env)' 
        : 'REAL (Active key loaded)'
    }`);
});
