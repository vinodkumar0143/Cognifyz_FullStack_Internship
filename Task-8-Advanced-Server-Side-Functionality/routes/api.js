const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const cacheController = require('../controllers/cacheController');
const logsController = require('../controllers/logsController');

// Background job queues
router.post('/jobs', jobController.createJob);
router.get('/jobs', jobController.listJobs);
router.get('/jobs/:id', jobController.getJobStatus);

// Server-side caching stats
router.get('/data', cacheController.getStats);
router.delete('/data/cache', cacheController.clearCache);

// Server console log monitoring
router.get('/logs', logsController.getLogs);
router.delete('/logs', logsController.clearLogs);

module.exports = router;
