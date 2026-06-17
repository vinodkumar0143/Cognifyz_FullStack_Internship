const logService = require('./services/logService');

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const config = require('./config/redis');
const requestLogger = require('./middleware/logger');
const customJsonParser = require('./middleware/parser');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const { startWorkers } = require('./workers/jobWorker');

const app = express();

// Custom Middleware
app.use(requestLogger);
app.use(customJsonParser);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/', webRoutes);
app.use('/api', apiRoutes);

// Start worker loops for background job execution
startWorkers();

// Global catch-all error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server Error Catch:', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 Server successfully launched. Running on http://localhost:${PORT}`);
});
