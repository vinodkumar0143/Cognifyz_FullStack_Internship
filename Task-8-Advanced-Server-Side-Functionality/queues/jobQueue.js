const Queue = require('bull');
const config = require('../config/redis');

function createQueue(name) {
  const queue = new Queue(name, {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    }
  });

  queue.on('error', (err) => {
    // Suppress repeated connection logs to avoid cluttering terminal
    if (err.code !== 'ECONNREFUSED') {
      console.error(`❌ Queue "${name}" error:`, err.message);
    }
  });

  return queue;
}

const emailQueue = createQueue('email-queue');
const reportQueue = createQueue('report-queue');
const notificationQueue = createQueue('notification-queue');

module.exports = {
  emailQueue,
  reportQueue,
  notificationQueue
};
