#!/usr/bin/env node

/**
 * Test script to verify Redis, Kafka, and real-time chat functionality
 * Usage: npm run test:services
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testResults = {
  redis: { status: 'pending', message: '' },
  kafka: { status: 'pending', message: '' },
  minio: { status: 'pending', message: '' },
  database: { status: 'pending', message: '' },
  socket: { status: 'pending', message: '' }
};

async function testRedis() {
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
      testResults.redis = { status: 'success', message: 'Redis connection and operations working' };
      log('✅ Redis: Connected and working', 'green');
    } else {
      testResults.redis = { status: 'error', message: 'Redis operations failed' };
      log('❌ Redis: Operations failed', 'red');
    }
    
    await client.quit();
  } catch (error) {
    testResults.redis = { status: 'error', message: error.message };
    log(`❌ Redis: ${error.message}`, 'red');
  }
}

async function testKafka() {
  log('\n🔍 Testing Kafka Connection...', 'cyan');
  try {
    const { Kafka } = require('kafkajs');
    
    const kafka = new Kafka({
      clientId: 'test-client',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 1
      }
    });

    const admin = kafka.admin();
    await admin.connect();
    
    // Test topic creation and listing
    const topics = await admin.listTopics();
    testResults.kafka = { status: 'success', message: `Connected to Kafka, found ${topics.length} topics` };
    log(`✅ Kafka: Connected successfully (${topics.length} topics)`, 'green');
    
    await admin.disconnect();
  } catch (error) {
    testResults.kafka = { status: 'error', message: error.message };
    log(`❌ Kafka: ${error.message}`, 'red');
  }
}

async function testMinIO() {
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

    // Test bucket operations
    const bucketName = process.env.MINIO_BUCKET_NAME || 'connection-server';
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (bucketExists) {
      testResults.minio = { status: 'success', message: `MinIO connected, bucket '${bucketName}' exists` };
      log(`✅ MinIO: Connected and bucket '${bucketName}' exists`, 'green');
    } else {
      testResults.minio = { status: 'warning', message: `MinIO connected but bucket '${bucketName}' not found` };
      log(`⚠️ MinIO: Connected but bucket '${bucketName}' not found`, 'yellow');
    }
  } catch (error) {
    testResults.minio = { status: 'error', message: error.message };
    log(`❌ MinIO: ${error.message}`, 'red');
  }
}

async function testDatabase() {
  log('\n🔍 Testing Database Connection...', 'cyan');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$connect();
    
    // Test basic query
    const userCount = await prisma.user.count();
    const serverCount = await prisma.server.count();
    
    testResults.database = { 
      status: 'success', 
      message: `Database connected, ${userCount} users, ${serverCount} servers` 
    };
    log(`✅ Database: Connected (${userCount} users, ${serverCount} servers)`, 'green');
    
    await prisma.$disconnect();
  } catch (error) {
    testResults.database = { status: 'error', message: error.message };
    log(`❌ Database: ${error.message}`, 'red');
  }
}

async function testSocketIO() {
  log('\n🔍 Testing Socket.IO Server...', 'cyan');
  try {
    // Test if the socket server can be imported and initialized
    const { initializeSocketServer } = require('../utils/socket');
    
    // Create a mock HTTP server for testing
    const http = require('http');
    const { Server } = require('socket.io');
    
    const server = http.createServer();
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Test socket server initialization
    const socketServer = initializeSocketServer(server);
    
    if (socketServer) {
      testResults.socket = { status: 'success', message: 'Socket.IO server can be initialized' };
      log('✅ Socket.IO: Server can be initialized', 'green');
    } else {
      testResults.socket = { status: 'error', message: 'Socket.IO server initialization failed' };
      log('❌ Socket.IO: Server initialization failed', 'red');
    }
    
    server.close();
  } catch (error) {
    testResults.socket = { status: 'error', message: error.message };
    log(`❌ Socket.IO: ${error.message}`, 'red');
  }
}

async function testRealtimeChat() {
  log('\n🔍 Testing Real-time Chat Functionality...', 'cyan');
  try {
    // Test if we can create a test token
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || '44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b';
    
    const testToken = jwt.sign(
      { id: 'test-user', email: 'test@example.com' },
      secret,
      { expiresIn: '1h' }
    );
    
    log(`✅ JWT Token: Generated test token (${testToken.substring(0, 20)}...)`, 'green');
    
    // Test socket connection endpoint
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/socket', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      log('✅ Socket Endpoint: /api/socket is accessible', 'green');
    } else {
      log(`⚠️ Socket Endpoint: /api/socket returned ${response.status}`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Real-time Chat: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('🚀 Starting Service Tests...', 'bright');
  log('================================', 'blue');
  
  // Run all tests
  await testRedis();
  await testKafka();
  await testMinIO();
  await testDatabase();
  await testSocketIO();
  await testRealtimeChat();
  
  // Summary
  log('\n📊 Test Summary:', 'bright');
  log('================================', 'blue');
  
  const results = Object.entries(testResults);
  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  
  results.forEach(([service, result]) => {
    const icon = result.status === 'success' ? '✅' : 
                 result.status === 'warning' ? '⚠️' : '❌';
    const color = result.status === 'success' ? 'green' : 
                 result.status === 'warning' ? 'yellow' : 'red';
    
    log(`${icon} ${service.toUpperCase()}: ${result.message}`, color);
    
    if (result.status === 'success') successCount++;
    else if (result.status === 'warning') warningCount++;
    else errorCount++;
  });
  
  log('\n================================', 'blue');
  log(`📈 Results: ${successCount} ✅ | ${warningCount} ⚠️ | ${errorCount} ❌`, 'bright');
  
  if (errorCount === 0) {
    log('🎉 All critical services are working!', 'green');
  } else {
    log(`⚠️ ${errorCount} service(s) need attention`, 'yellow');
  }
  
  log('================================', 'blue');
}

// Handle command line arguments
if (require.main === module) {
  runAllTests().catch(error => {
    log(`💥 Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults };
