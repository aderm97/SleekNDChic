import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  retryStrategy: (times) => {
    if (times > 10) {
      console.error('[redis] Max retries reached — stopping reconnection');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: true,
});

redis.on('connect', () => {
  console.log('[redis] Connected');
});

redis.on('ready', () => {
  console.log('[redis] Ready to accept commands');
});

redis.on('error', (err) => {
  console.error('[redis] Error:', err.message);
});

redis.on('close', () => {
  console.log('[redis] Connection closed');
});

// Connect explicitly — allows catching connection errors at startup
redis.connect().catch((err) => {
  console.error('[redis] Initial connection failed:', err.message);
  console.warn('[redis] App will continue without Redis — cache/queue features may be unavailable');
});

export default redis;
