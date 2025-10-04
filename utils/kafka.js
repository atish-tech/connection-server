const { Kafka } = require('kafkajs');

// Message event types
const MessageEventType = {
  NEW_MESSAGE: 'NEW_MESSAGE',
  MESSAGE_EDITED: 'MESSAGE_EDITED',
  MESSAGE_DELETED: 'MESSAGE_DELETED',
  USER_TYPING: 'USER_TYPING',
  USER_JOINED: 'USER_JOINED',
  USER_LEFT: 'USER_LEFT',
  USER_ONLINE: 'USER_ONLINE',
  USER_OFFLINE: 'USER_OFFLINE'
};

// Topic names
const CHAT_MESSAGE_TOPIC = 'chat-messages';
const USER_ACTIVITY_TOPIC = 'user-activity';
const MESSAGE_DELIVERY_TOPIC = 'message-delivery';

// Kafka client and producer
let kafka;
let producer;
let isConnected = false;

/**
 * Initialize Kafka producer and consumers
 */
async function initKafka() {
  try {
    // Create Kafka client
    kafka = new Kafka({
      clientId: 'connection-server',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      retry: {
        initialRetryTime: 300,
        retries: 10
      }
    });

    // Create producer
    producer = kafka.producer();
    
    // Connect the producer with retry logic
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries) {
      try {
        await producer.connect();
        console.log('Kafka producer connected');
        isConnected = true;
        break;
      } catch (err) {
        retries++;
        console.warn(`Failed to connect to Kafka (attempt ${retries}/${maxRetries}):`, err.message);
        if (retries >= maxRetries) {
          throw new Error(`Failed to connect to Kafka after ${maxRetries} attempts`);
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 10000)));
      }
    }

    // Create topics if they don't exist
    try {
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
    } catch (err) {
      console.warn('Error creating Kafka topics:', err.message);
      // We continue even if topic creation fails, they might already exist
    }
    
  } catch (error) {
    console.error('Failed to initialize Kafka:', error);
    throw error;
  }
}

/**
 * Send message to Kafka
 */
async function sendChatMessage(message) {
  if (!isConnected || !producer) {
    throw new Error('Kafka producer not connected');
  }
  
  try {
    const kafkaMessage = {
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

/**
 * Send user activity to Kafka
 */
async function sendUserActivity(
  userId, 
  eventType, 
  serverId, 
  channelId
) {
  if (!isConnected || !producer) {
    throw new Error('Kafka producer not connected');
  }
  
  try {
    const kafkaMessage = {
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

/**
 * Send user typing notification to Kafka
 */
async function sendUserTyping(
  userId,
  serverId,
  channelId
) {
  await sendUserActivity(userId, MessageEventType.USER_TYPING, serverId, channelId);
}

/**
 * Create a consumer for a specific group and topic
 */
function createConsumer(groupId) {
  if (!kafka) {
    throw new Error('Kafka client not initialized');
  }
  return kafka.consumer({ groupId });
}

/**
 * Disconnect from Kafka
 */
async function disconnectKafka() {
  if (producer) {
    await producer.disconnect();
    isConnected = false;
    console.log('Kafka producer disconnected');
  }
}

module.exports = {
  initKafka,
  sendChatMessage,
  sendUserActivity,
  sendUserTyping,
  createConsumer,
  disconnectKafka,
  MessageEventType
};
