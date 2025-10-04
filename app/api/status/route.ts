import { NextResponse } from 'next/server';
import { redisTestConnection } from '@/utils/redis-api';
import { Kafka } from 'kafkajs';

export async function GET() {
  const status = {
    redis: { connected: false, message: '' },
    kafka: { connected: false, message: '' },
    postgres: { connected: false, message: '' },
    minio: { connected: false, message: '' }
  };

  // Check Redis
  try {
    const isConnected = await redisTestConnection();
    
    if (isConnected) {
      status.redis.connected = true;
      status.redis.message = 'Connected to Redis successfully';
    } else {
      status.redis.message = 'Redis connection test failed';
    }
  } catch (error) {
    status.redis.message = `Redis connection error: ${error instanceof Error ? error.message : String(error)}`;
  }

  // Check Kafka if enabled
  if (process.env.KAFKA_AVAILABLE === 'true') {
    try {
      const kafka = new Kafka({
        clientId: 'connection-server-status',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      });
      
      const admin = kafka.admin();
      await admin.connect();
      const topics = await admin.listTopics();
      await admin.disconnect();
      
      status.kafka.connected = true;
      status.kafka.message = `Connected to Kafka successfully. Available topics: ${topics.join(', ')}`;
    } catch (error) {
      status.kafka.message = `Kafka connection error: ${error instanceof Error ? error.message : String(error)}`;
    }
  } else {
    status.kafka.message = 'Kafka is disabled in configuration';
  }

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}
