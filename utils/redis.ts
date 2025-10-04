import Redis, { ChainableCommander } from 'ioredis';

// Redis client configuration
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  // Add connection options for better reliability
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => {
    // Retry with exponential backoff
    return Math.min(times * 50, 2000); // Max 2 seconds delay
  },
  connectTimeout: 10000, // 10 seconds
  enableReadyCheck: true,
  enableOfflineQueue: true,
});

// Key prefixes for Redis
const USER_PRESENCE_KEY = 'user:presence:';
const SERVER_PRESENCE_KEY = 'server:presence:';
const CHANNEL_PRESENCE_KEY = 'channel:presence:';
const USER_ONLINE_COUNT_KEY = 'user:online:count';

/**
 * User presence handling
 */
export async function setUserOnline(userId: string, serverId?: string, channelId?: number): Promise<void> {
  const pipeline: ChainableCommander = redisClient.pipeline();
  
  // Add user to global online users set
  pipeline.sadd('online:users', userId);
  
  // Set user presence with 60 second TTL for automatic cleanup if disconnected
  pipeline.set(`${USER_PRESENCE_KEY}${userId}`, JSON.stringify({ 
    isOnline: true, 
    lastSeen: new Date().toISOString(),
    serverId, 
    channelId 
  }), 'EX', 60);
  
  // Increment online user count
  pipeline.incr(USER_ONLINE_COUNT_KEY);
  
  // Add user to server presence if provided
  if (serverId) {
    pipeline.sadd(`${SERVER_PRESENCE_KEY}${serverId}`, userId);
  }
  
  // Add user to channel presence if provided
  if (channelId) {
    pipeline.sadd(`${CHANNEL_PRESENCE_KEY}${channelId}`, userId);
  }
  
  await pipeline.exec();
}

export async function keepUserOnline(userId: string): Promise<void> {
  const userPresenceKey = `${USER_PRESENCE_KEY}${userId}`;
  
  // Check if user is marked online
  const userPresence = await redisClient.get(userPresenceKey);
  
  if (userPresence) {
    const presence = JSON.parse(userPresence);
    
    // Update last seen time and extend TTL
    await redisClient.set(userPresenceKey, JSON.stringify({
      ...presence,
      lastSeen: new Date().toISOString(),
    }), 'EX', 60); // 60 second TTL
  }
}

export async function setUserOffline(userId: string): Promise<void> {
  const pipeline = redisClient.pipeline();
  const userPresenceKey = `${USER_PRESENCE_KEY}${userId}`;
  
  // Get user presence data to know which server/channel to remove from
  const userPresence = await redisClient.get(userPresenceKey);
  
  if (userPresence) {
    const { serverId, channelId } = JSON.parse(userPresence);
    
    // Remove from server presence
    if (serverId) {
      pipeline.srem(`${SERVER_PRESENCE_KEY}${serverId}`, userId);
    }
    
    // Remove from channel presence
    if (channelId) {
      pipeline.srem(`${CHANNEL_PRESENCE_KEY}${channelId}`, userId);
    }
  }
  
  // Remove user from global online users
  pipeline.srem('online:users', userId);
  
  // Delete user presence key
  pipeline.del(userPresenceKey);
  
  // Get current count
  const currentCount = await redisClient.get(USER_ONLINE_COUNT_KEY);
  
  // Decrement online user count, but don't go below 0
  if (currentCount && parseInt(currentCount) > 0) {
    pipeline.decr(USER_ONLINE_COUNT_KEY);
  }
  
  await pipeline.exec();
}

export async function updateUserPresence(userId: string, serverId?: string, channelId?: number): Promise<void> {
  const userPresenceKey = `${USER_PRESENCE_KEY}${userId}`;
  const userPresence = await redisClient.get(userPresenceKey);
  
  if (userPresence) {
    const presence = JSON.parse(userPresence);
    const oldServerId = presence.serverId;
    const oldChannelId = presence.channelId;
    
    const pipeline = redisClient.pipeline();
    
    // Update presence data
    pipeline.set(userPresenceKey, JSON.stringify({ 
      isOnline: true, 
      lastSeen: new Date().toISOString(),
      serverId: serverId || presence.serverId, 
      channelId: channelId || presence.channelId 
    }), 'EX', 60);
    
    // Handle server changes
    if (serverId && oldServerId && serverId !== oldServerId) {
      pipeline.srem(`${SERVER_PRESENCE_KEY}${oldServerId}`, userId);
      pipeline.sadd(`${SERVER_PRESENCE_KEY}${serverId}`, userId);
    } else if (serverId && !oldServerId) {
      pipeline.sadd(`${SERVER_PRESENCE_KEY}${serverId}`, userId);
    }
    
    // Handle channel changes
    if (channelId && oldChannelId && channelId !== oldChannelId) {
      pipeline.srem(`${CHANNEL_PRESENCE_KEY}${oldChannelId}`, userId);
      pipeline.sadd(`${CHANNEL_PRESENCE_KEY}${channelId}`, userId);
    } else if (channelId && !oldChannelId) {
      pipeline.sadd(`${CHANNEL_PRESENCE_KEY}${channelId}`, userId);
    }
    
    await pipeline.exec();
  } else {
    // User not in presence system, set them online
    await setUserOnline(userId, serverId, channelId);
  }
}

/**
 * Get online status and counts
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  return await redisClient.sismember('online:users', userId) === 1;
}

export async function getUserOnlineCount(): Promise<number> {
  const count = await redisClient.get(USER_ONLINE_COUNT_KEY);
  return count ? parseInt(count) : 0;
}

export async function getOnlineUsersInServer(serverId: string): Promise<string[]> {
  return await redisClient.smembers(`${SERVER_PRESENCE_KEY}${serverId}`);
}

export async function getOnlineUsersInChannel(channelId: number): Promise<string[]> {
  return await redisClient.smembers(`${CHANNEL_PRESENCE_KEY}${channelId}`);
}

export async function getOnlineUserCount(serverId?: string, channelId?: number): Promise<number> {
  if (channelId) {
    const members = await getOnlineUsersInChannel(channelId);
    return members.length;
  } else if (serverId) {
    const members = await getOnlineUsersInServer(serverId);
    return members.length;
  } else {
    return await getUserOnlineCount();
  }
}

/**
 * Test Redis connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const testKey = 'connection:test:' + Date.now();
    await redisClient.set(testKey, 'ok');
    const result = await redisClient.get(testKey);
    await redisClient.del(testKey);
    return result === 'ok';
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}

// Add event listeners for connection status
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

export default redisClient;
