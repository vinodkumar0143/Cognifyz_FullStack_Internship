const Redis = require('ioredis');
const config = require('../config/redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.mockCache = new Map();
    this.init();
  }

  init() {
    try {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
          if (times > 2) {
            if (times === 3) {
              console.warn('⚠️ Redis is unreachable. Caching and Job Queues will run in fallback/limited mode.');
            }
            return null; // Stop retrying
          }
          return 1000;
        }
      });

      this.client.on('connect', () => {
        // Connected
      });

      this.client.on('ready', () => {
        this.isReady = true;
        console.log('✅ Redis client is ready and connected.');
      });

      this.client.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
          this.isReady = false;
        } else {
          console.error('❌ Redis Client Error:', err.message);
        }
      });

      this.client.on('close', () => {
        this.isReady = false;
      });
    } catch (error) {
      console.error('❌ Failed to initialize Redis client:', error.message);
      this.isReady = false;
    }
  }

  async get(key) {
    if (!this.isReady || !this.client) {
      // In-memory mock fallback get
      const item = this.mockCache.get(key);
      if (item && item.expiry > Date.now()) {
        return item.value;
      }
      return null;
    }
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(`❌ Redis get failed for key "${key}":`, err.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 30) {
    if (!this.isReady || !this.client) {
      // In-memory mock fallback set
      this.mockCache.set(key, {
        value,
        expiry: Date.now() + (ttlSeconds * 1000)
      });
      return true;
    }
    try {
      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized, 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.error(`❌ Redis set failed for key "${key}":`, err.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isReady || !this.client) {
      // In-memory mock fallback del
      this.mockCache.delete(key);
      return true;
    }
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      console.error(`❌ Redis del failed for key "${key}":`, err.message);
      return false;
    }
  }

  isConnected() {
    return this.isReady;
  }
}

module.exports = new RedisService();
