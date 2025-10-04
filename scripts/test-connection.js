#!/usr/bin/env node

/**
 * Simple connection test for Redis, Kafka, and Database
 * Usage: npm run test:connection
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function testRedisConnection() {
  log('\n🔍 Testing Redis Connection...', 'cyan');
  try {
    const redis = require('redis');
    const client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    });

    await client.connect();
    
    // Test basic operations
    await client.set('test:connection', 'success', { EX: 10 });
    const result = await client.get('test:connection');
    await client.del('test:connection');
    
    if (result === 'success') {
      log('✅ Redis: Connected and working', 'green');
      return true;
    } else {
      log('❌ Redis: Operations failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Redis: ${error.message}`, 'red');
    return false;
  }
}

async function testKafkaConnection() {
  log('\n🔍 Testing Kafka Connection...', 'cyan');
  
  // Store original environment variable
  const originalBroker = process.env.KAFKA_BROKER;
  
  try {
    const { Kafka } = require('kafkajs');
    
    // Check if Kafka is available
    if (process.env.KAFKA_AVAILABLE === 'false') {
      log('⚠️ Kafka: Disabled by KAFKA_AVAILABLE=false', 'yellow');
      return true; // Consider it working if intentionally disabled
    }
    
    // Override environment variable for external connection
    // Use port 29092 for external connections (as configured in Docker)
    process.env.KAFKA_BROKER = 'localhost:29092';
    
    // Force localhost for external connections (override Docker service name)
    const broker = 'localhost:29092';
    log(`🔗 Connecting to Kafka at: ${broker}`, 'cyan');
    
    const kafka = new Kafka({
      clientId: 'test-client',
      brokers: [broker],
      retry: {
        initialRetryTime: 100,
        retries: 1
      },
      connectionTimeout: 3000,
      requestTimeout: 3000
    });

    const admin = kafka.admin();
    await admin.connect();
    
    const topics = await admin.listTopics();
    log(`✅ Kafka: Connected successfully (${topics.length} topics)`, 'green');
    
    await admin.disconnect();
    
    // Restore original environment variable
    if (originalBroker) {
      process.env.KAFKA_BROKER = originalBroker;
    } else {
      delete process.env.KAFKA_BROKER;
    }
    
    return true;
  } catch (error) {
    // Restore original environment variable
    if (originalBroker) {
      process.env.KAFKA_BROKER = originalBroker;
    } else {
      delete process.env.KAFKA_BROKER;
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      log(`⚠️ Kafka: Not running (${error.message})`, 'yellow');
      log('💡 Tip: Start Kafka with: npm run docker:dev:up', 'cyan');
      return false;
    } else {
      log(`❌ Kafka: ${error.message}`, 'red');
      return false;
    }
  }
}

async function testDatabaseConnection() {
  log('\n🔍 Testing Database Connection...', 'cyan');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    
    const userCount = await prisma.user.count();
    const serverCount = await prisma.server.count();
    
    log(`✅ Database: Connected (${userCount} users, ${serverCount} servers)`, 'green');
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    log(`❌ Database: ${error.message}`, 'red');
    return false;
  }
}

async function testMinIOConnection() {
  log('\n🔍 Testing MinIO Connection...', 'cyan');
  try {
    const { Client } = require('minio');
    
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });

    const bucketName = process.env.MINIO_BUCKET_NAME || 'connection-server';
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (bucketExists) {
      log(`✅ MinIO: Connected and bucket '${bucketName}' exists`, 'green');
    } else {
      log(`⚠️ MinIO: Connected but bucket '${bucketName}' not found`, 'yellow');
    }
    return true;
  } catch (error) {
    log(`❌ MinIO: ${error.message}`, 'red');
    return false;
  }
}

async function testJWTToken() {
  log('\n🔍 Testing JWT Token Generation...', 'cyan');
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || '44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b';
    
    const testToken = jwt.sign(
      { id: 'test-user', email: 'test@example.com' },
      secret,
      { expiresIn: '1h' }
    );
    
    // Verify the token
    const decoded = jwt.verify(testToken, secret);
    
    if (decoded.id === 'test-user') {
      log(`✅ JWT: Token generation and verification working`, 'green');
      return true;
    } else {
      log('❌ JWT: Token verification failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ JWT: ${error.message}`, 'red');
    return false;
  }
}

async function checkDockerServices() {
  log('\n🔍 Checking Docker Services...', 'cyan');
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const { stdout } = await execAsync('docker-compose ps --format "table {{.Name}}\\t{{.Status}}"');
    
    if (stdout.includes('Up')) {
      log('✅ Docker: Some services are running', 'green');
      log(stdout, 'cyan');
      return true;
    } else {
      log('⚠️ Docker: No services running', 'yellow');
      log('💡 Tip: Start services with: npm run docker:dev:up', 'cyan');
      return false;
    }
  } catch (error) {
    log('⚠️ Docker: Not available or no services running', 'yellow');
    return false;
  }
}

async function runConnectionTests() {
  log('🚀 Starting Connection Tests...', 'bright');
  log('================================', 'blue');
  
  // Check Docker services first
  const dockerRunning = await checkDockerServices();
  
  const results = {
    redis: await testRedisConnection(),
    kafka: await testKafkaConnection(),
    database: await testDatabaseConnection(),
    minio: await testMinIOConnection(),
    jwt: await testJWTToken()
  };
  
  // Summary
  log('\n📊 Test Results:', 'bright');
  log('================================', 'blue');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  Object.entries(results).forEach(([service, success]) => {
    const icon = success ? '✅' : '❌';
    const color = success ? 'green' : 'red';
    log(`${icon} ${service.toUpperCase()}: ${success ? 'Working' : 'Failed'}`, color);
  });
  
  log('\n================================', 'blue');
  log(`📈 Results: ${successCount}/${totalCount} services working`, 'bright');
  
  if (successCount === totalCount) {
    log('🎉 All services are connected and working!', 'green');
  } else {
    log(`⚠️ ${totalCount - successCount} service(s) need attention`, 'yellow');
    
    // Provide helpful next steps
    log('\n🔧 Next Steps:', 'bright');
    if (!results.kafka) {
      log('• Start Kafka: npm run docker:dev:up', 'cyan');
    }
    if (!results.redis) {
      log('• Check Redis: docker-compose logs redis', 'cyan');
    }
    if (!results.minio) {
      log('• Check MinIO: docker-compose logs minio', 'cyan');
    }
    if (!results.database) {
      log('• Check Database: npx prisma db push', 'cyan');
    }
    log('• Run tests again: npm run test:connection', 'cyan');
  }
  
  log('================================', 'blue');
  
  return results;
}

// Run tests if called directly
if (require.main === module) {
  runConnectionTests().catch(error => {
    log(`💥 Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runConnectionTests };
