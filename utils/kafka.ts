import { Kafka, Producer, Consumer, Message } from 'kafkajs';
import { ChannelMessageType } from '@prisma/client';

// Kafka client configuration
const kafka = new Kafka({
  clientId: 'connection-server',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

// Create producer
const producer = kafka.producer();

// Topic names
const CHAT_MESSAGE_TOPIC = 'chat-messages';
const USER_ACTIVITY_TOPIC = 'user-activity';
const MESSAGE_DELIVERY_TOPIC = 'message-delivery';

// Message types
export enum MessageEventType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  MESSAGE_EDITED = 'MESSAGE_EDITED',
  MESSAGE_DELETED = 'MESSAGE_DELETED',
  USER_TYPING = 'USER_TYPING',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  USER_ONLINE = 'USER_ONLINE',
  USER_OFFLINE = 'USER_OFFLINE'
}

// Interface for chat message
export interface ChatMessage {
  id?: string;
  content: string;
  type: ChannelMessageType;
  channelId: number;
  serverId: string;
  memberId: number;
  createdAt?: Date;
  updatedAt?: Date;
  isEdited?: boolean;
}

// Interface for kafka message
export interface KafkaMessage {
  eventType: MessageEventType;
  payload: any;
  metadata: {
    timestamp: string;
    userId?: string;
    serverId?: string;
    channelId?: number;
  };
}

/**
 * Initialize Kafka producer and consumers
 */
export async function initKafka(): Promise<void> {
  try {
    // Connect the producer
    await producer.connect();
    console.log('Kafka producer connected');

    // Create topics if they don't exist
    const admin = kafka.admin();
    await admin.connect();
    
    const topics = await admin.listTopics();
    
    const topicsToCreate = [];
    if (!topics.includes(CHAT_MESSAGE_TOPIC)) {
      topicsToCreate.push({
        topic: CHAT_MESSAGE_TOPIC,
        numPartitions: 3, // For high throughput
        replicationFactor: 1 // Set to 3 in production with multiple brokers
      });
    }
    
    if (!topics.includes(USER_ACTIVITY_TOPIC)) {
      topicsToCreate.push({
        topic: USER_ACTIVITY_TOPIC,
        numPartitions: 2,
        replicationFactor: 1
      });
    }
    
    if (!topics.includes(MESSAGE_DELIVERY_TOPIC)) {
      topicsToCreate.push({
        topic: MESSAGE_DELIVERY_TOPIC,
        numPartitions: 3,
        replicationFactor: 1
      });
    }
    
    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true
      });
    }
    
    await admin.disconnect();
    
  } catch (error) {
    console.error('Failed to initialize Kafka:', error);
    throw error;
  }
}

/**
 * Send message to Kafka
 */
export async function sendChatMessage(message: ChatMessage): Promise<void> {
  try {
    const kafkaMessage: KafkaMessage = {
      eventType: MessageEventType.NEW_MESSAGE,
      payload: message,
      metadata: {
        timestamp: new Date().toISOString(),
        userId: message.memberId?.toString(),
        serverId: message.serverId,
        channelId: message.channelId
      }
    };
    
    await producer.send({
      topic: CHAT_MESSAGE_TOPIC,
      messages: [
        { 
          key: `${message.channelId}`, 
          value: JSON.stringify(kafkaMessage),
          headers: {
            messageType: 'chat',
            timestamp: Date.now().toString()
          }
        }
      ]
    });
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
    throw error;
  }
}

export async function sendUserActivity(
  userId: string, 
  eventType: MessageEventType, 
  serverId?: string, 
  channelId?: number
): Promise<void> {
  try {
    const kafkaMessage: KafkaMessage = {
      eventType,
      payload: { userId },
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        serverId,
        channelId
      }
    };
    
    await producer.send({
      topic: USER_ACTIVITY_TOPIC,
      messages: [
        { 
          key: userId, 
          value: JSON.stringify(kafkaMessage) 
        }
      ]
    });
  } catch (error) {
    console.error('Error sending user activity to Kafka:', error);
    throw error;
  }
}

export async function sendUserTyping(
  userId: string,
  serverId: string,
  channelId: number
): Promise<void> {
  await sendUserActivity(userId, MessageEventType.USER_TYPING, serverId, channelId);
}

/**
 * Create a consumer for a specific group and topic
 */
export function createConsumer(groupId: string): Consumer {
  return kafka.consumer({ groupId });
}

/**
 * Disconnect from Kafka
 */
export async function disconnectKafka(): Promise<void> {
  await producer.disconnect();
}

export default {
  initKafka,
  sendChatMessage,
  sendUserActivity,
  sendUserTyping,
  createConsumer,
  disconnectKafka,
  MessageEventType
};
