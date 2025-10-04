/**
 * Separate Redis client for API routes
 * This is to avoid Next.js import issues with Redis in API routes
 */

import Redis from 'ioredis';

// Redis client configuration for API routes
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    return Math.min(times * 50, 1000);
  },
  connectTimeout: 5000,
});

// Export basic Redis operations
export const redisGet = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
};

export const redisSet = async (key: string, value: string, ttl?: number): Promise<boolean> => {
  try {
    if (ttl) {
      await redisClient.set(key, value, 'EX', ttl);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
};

export const redisDel = async (key: string): Promise<boolean> => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis DEL error:', error);
    return false;
  }
};

export const redisTestConnection = async (): Promise<boolean> => {
  try {
    const testKey = `test:${Date.now()}`;
    await redisSet(testKey, 'ok');
    const result = await redisGet(testKey);
    await redisDel(testKey);
    return result === 'ok';
  } catch (error) {
    console.error('Redis connection test error:', error);
    return false;
  }
};

export default redisClient;
