import { createClient } from 'redis';

// Global redis connection - created once and reused
let redis = null;

/**
 * Get the global Redis connection
 * Creates connection on first call, then reuses it
 * @returns {Promise<RedisClient>} Redis client instance
 */
export async function getRedis() {
  if (!redis) {
    redis = await createClient({ url: process.env.REDIS_URL }).connect();
  }
  return redis;
}