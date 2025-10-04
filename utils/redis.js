const Redis = require('ioredis');

let redisClient = null;

/**
 * Get Redis client instance
 */
function getClient() {
  if (!redisClient) {
    // Initialize Redis client
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });
  }
  
  return redisClient;
}

/**
 * Set user's online status
 * @param {string} userId - User ID
 * @param {string} status - Status ('online' or 'offline')
 * @param {string} socketId - Socket ID (optional for online status)
 */
async function setUserStatus(userId, status, socketId = null) {
  try {
    const client = getClient();
    
    if (status === 'online') {
      // Store user online status with socket ID
      await client.hset(`user:${userId}`, 'status', 'online', 'socketId', socketId);
      // Set expiration for online status (auto-expire after 1 hour of inactivity)
      await client.expire(`user:${userId}`, 3600);
    } else {
      // Remove user status on offline
      await client.del(`user:${userId}`);
    }
    
    // Publish status change to Redis channel
    await client.publish('user-status', JSON.stringify({
      userId,
      status,
      timestamp: Date.now()
    }));
    
    return true;
  } catch (err) {
    console.error('Error setting user status:', err);
    return false;
  }
}

/**
 * Get user's online status
 * @param {string} userId - User ID
 */
async function getUserStatus(userId) {
  try {
    const client = getClient();
    const status = await client.hget(`user:${userId}`, 'status') || 'offline';
    return status;
  } catch (err) {
    console.error('Error getting user status:', err);
    return 'offline';
  }
}

/**
 * Get all online users
 */
async function getOnlineUsers() {
  try {
    const client = getClient();
    const keys = await client.keys('user:*');
    const onlineUsers = [];
    
    for (const key of keys) {
      const userId = key.split(':')[1];
      const status = await client.hget(key, 'status');
      
      if (status === 'online') {
        onlineUsers.push(userId);
      }
    }
    
    return onlineUsers;
  } catch (err) {
    console.error('Error getting online users:', err);
    return [];
  }
}

/**
 * Cache message for a specific channel
 * @param {string} channelId - Channel ID
 * @param {Object} message - Message object
 */
async function cacheMessage(channelId, message) {
  try {
    const client = getClient();
    await client.lpush(`channel:${channelId}:messages`, JSON.stringify(message));
    // Only keep last 100 messages per channel
    await client.ltrim(`channel:${channelId}:messages`, 0, 99);
    return true;
  } catch (err) {
    console.error('Error caching message:', err);
    return false;
  }
}

/**
 * Get cached messages for a specific channel
 * @param {string} channelId - Channel ID
 * @param {number} limit - Maximum number of messages to get
 */
async function getCachedMessages(channelId, limit = 50) {
  try {
    const client = getClient();
    const messages = await client.lrange(`channel:${channelId}:messages`, 0, limit - 1);
    return messages.map(msg => JSON.parse(msg));
  } catch (err) {
    console.error('Error getting cached messages:', err);
    return [];
  }
}

/**
 * Close Redis connection
 */
async function closeConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
}

module.exports = {
  getClient,
  setUserStatus,
  getUserStatus,
  getOnlineUsers,
  cacheMessage,
  getCachedMessages,
  closeConnection
};
