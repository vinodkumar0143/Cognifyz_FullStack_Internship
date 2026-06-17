require('dotenv').config();

module.exports = {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
  }
};
