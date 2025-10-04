const Redis = require('ioredis');

// Create Redis client
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  // Add some options to improve connection reliability
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => {
    // Retry with exponential backoff
    return Math.min(times * 50, 2000); // Max 2 seconds delay
  },
  connectTimeout: 10000 // 10 seconds
});

// Test connection
redis.on('connect', () => {
  console.log('Connected to Redis!');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Try to set and get a value
async function testRedisOperations() {
  try {
    // Test with raw commands to verify functionality
    console.log('Testing Redis operations...');
    
    // Test SET operation
    await redis.set('test:connection', 'success');
    console.log('SET operation successful');

    // Test GET operation
    const value = await redis.get('test:connection');
    console.log('GET operation successful. Retrieved value:', value);

    // Test DEL operation
    await redis.del('test:connection');
    console.log('DEL operation successful');

    // Test SADD operation
    await redis.sadd('test:set', 'member1');
    console.log('SADD operation successful');

    // Test SMEMBERS operation
    const members = await redis.smembers('test:set');
    console.log('SMEMBERS operation successful. Members:', members);

    // Test SREM operation
    await redis.srem('test:set', 'member1');
    console.log('SREM operation successful');

    // Test INCR operation
    await redis.set('test:counter', '0');
    await redis.incr('test:counter');
    const counter = await redis.get('test:counter');
    console.log('INCR operation successful. Counter:', counter);

    // Test DECR operation
    await redis.decr('test:counter');
    const decrementedCounter = await redis.get('test:counter');
    console.log('DECR operation successful. Counter:', decrementedCounter);

    // Clean up
    await redis.del('test:counter');
    await redis.del('test:set');
    console.log('Cleanup successful');

    // Close connection
    await redis.quit();
    console.log('Redis connection closed');
  } catch (error) {
    console.error('Redis operation error:', error);
  }
}

// Run the test
testRedisOperations();
