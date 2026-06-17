const redisService = require('../services/redisService');

const getDbStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        usersCount: Math.floor(Math.random() * 500) + 1200,
        activeSessions: Math.floor(Math.random() * 50) + 120,
        totalSales: (Math.random() * 5000 + 10000).toFixed(2),
        systemLoad: `${(Math.random() * 10 + 2).toFixed(1)}%`,
        generatedAt: new Date().toISOString()
      });
    }, 2000);
  });
};

module.exports = {
  getStats: async (req, res) => {
    const cacheKey = 'dashboard:stats';
    const start = Date.now();

    let stats = null;
    let cacheHit = false;

    // Directly query the cache; redisService will route to Redis or the In-Memory Map
    stats = await redisService.get(cacheKey);
    if (stats) {
      cacheHit = true;
    }

    if (!stats) {
      stats = await getDbStats();
      await redisService.set(cacheKey, stats, 30);
    }

    const duration = Date.now() - start;

    res.setHeader('X-Cache-Status', cacheHit ? 'HIT' : 'MISS');
    res.setHeader('X-Response-Time', `${duration}ms`);

    return res.json({
      success: true,
      cacheStatus: cacheHit ? 'HIT' : 'MISS',
      responseTime: `${duration}ms`,
      redisStatus: redisService.isConnected() ? 'Connected' : 'Unavailable (Mock Mode)',
      data: stats
    });
  },

  clearCache: async (req, res) => {
    const cacheKey = 'dashboard:stats';
    try {
      await redisService.del(cacheKey);
      console.log('🧹 Cache: Evicted dashboard stats key.');
      return res.json({ success: true, message: 'Cache cleared successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
