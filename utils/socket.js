const { Server } = require('socket.io');
const kafka = require('./kafka');
const redis = require('./redis');

// Store for socket instances
let io = null;
let chatConsumer = null;
let activityConsumer = null;

// Socket event types
const EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  JOIN_SERVER: 'join_server',
  LEAVE_SERVER: 'leave_server',
  JOIN_CHANNEL: 'join_channel',
  LEAVE_CHANNEL: 'leave_channel',
  NEW_MESSAGE: 'new_message',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
  USER_TYPING: 'user_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline'
};

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 */
function initializeSocketServer(server) {
  // Initialize Socket.IO with CORS settings
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Handle connection events
  io.on(EVENTS.CONNECT, (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Handle authentication
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      console.warn(`Socket ${socket.id} connected without a userId`);
      return;
    }

    // Store user's socket ID in Redis for tracking online status
    redis.setUserStatus(userId, 'online', socket.id).catch(console.error);
    
    // Broadcast user's online status
    socket.broadcast.emit(EVENTS.USER_ONLINE, { userId });

    // Handle server joins
    socket.on(EVENTS.JOIN_SERVER, (data) => {
      const { serverId } = data;
      if (serverId) {
        socket.join(`server:${serverId}`);
        console.log(`User ${userId} joined server ${serverId}`);
      }
    });

    // Handle channel joins
    socket.on(EVENTS.JOIN_CHANNEL, (data) => {
      const { serverId, channelId } = data;
      if (serverId && channelId) {
        socket.join(`channel:${serverId}:${channelId}`);
        console.log(`User ${userId} joined channel ${channelId} in server ${serverId}`);
      }
    });

    // Handle typing events
    socket.on(EVENTS.USER_TYPING, async (data) => {
      const { serverId, channelId } = data;
      if (serverId && channelId) {
        // Send to Kafka
        try {
          await kafka.sendUserTyping(userId, serverId, channelId);
        } catch (error) {
          console.error('Error sending typing event to Kafka:', error);
          
          // Fallback: broadcast directly to channel members
          socket.to(`channel:${serverId}:${channelId}`).emit(EVENTS.USER_TYPING, {
            userId,
            serverId,
            channelId,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Handle disconnection
    socket.on(EVENTS.DISCONNECT, async () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Update Redis with offline status
      await redis.setUserStatus(userId, 'offline').catch(console.error);
      
      // Broadcast offline status
      socket.broadcast.emit(EVENTS.USER_OFFLINE, { userId });
    });
  });

  console.log('Socket.IO server initialized');
}

/**
 * Subscribe to Kafka topics
 */
async function subscribeToKafkaTopics() {
  try {
    // Create consumer for chat messages
    chatConsumer = kafka.createConsumer('connection-server-chat-group');
    
    // Subscribe to chat message topic
    await chatConsumer.subscribe({ topic: 'chat-messages', fromBeginning: false });
    
    // Process incoming chat messages
    await chatConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageContent = JSON.parse(message.value.toString());
          const { eventType, payload, metadata } = messageContent;
          
          // Handle based on event type
          switch (eventType) {
            case kafka.MessageEventType.NEW_MESSAGE:
              if (io && metadata.serverId && metadata.channelId) {
                io.to(`channel:${metadata.serverId}:${metadata.channelId}`).emit(EVENTS.NEW_MESSAGE, payload);
              }
              break;
            case kafka.MessageEventType.MESSAGE_EDITED:
              if (io && metadata.serverId && metadata.channelId) {
                io.to(`channel:${metadata.serverId}:${metadata.channelId}`).emit(EVENTS.MESSAGE_EDITED, payload);
              }
              break;
            case kafka.MessageEventType.MESSAGE_DELETED:
              if (io && metadata.serverId && metadata.channelId) {
                io.to(`channel:${metadata.serverId}:${metadata.channelId}`).emit(EVENTS.MESSAGE_DELETED, payload);
              }
              break;
            default:
              console.log(`Unhandled event type: ${eventType}`);
          }
        } catch (err) {
          console.error('Error processing chat message from Kafka:', err);
        }
      }
    });
    
    // Create consumer for user activity
    activityConsumer = kafka.createConsumer('connection-server-activity-group');
    
    // Subscribe to user activity topic
    await activityConsumer.subscribe({ topic: 'user-activity', fromBeginning: false });
    
    // Process incoming user activity
    await activityConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageContent = JSON.parse(message.value.toString());
          const { eventType, payload, metadata } = messageContent;
          
          // Handle based on event type
          switch (eventType) {
            case kafka.MessageEventType.USER_TYPING:
              if (io && metadata.serverId && metadata.channelId) {
                io.to(`channel:${metadata.serverId}:${metadata.channelId}`).emit(EVENTS.USER_TYPING, {
                  userId: payload.userId,
                  serverId: metadata.serverId,
                  channelId: metadata.channelId,
                  timestamp: metadata.timestamp
                });
              }
              break;
            case kafka.MessageEventType.USER_ONLINE:
              if (io) {
                io.emit(EVENTS.USER_ONLINE, { userId: payload.userId });
              }
              break;
            case kafka.MessageEventType.USER_OFFLINE:
              if (io) {
                io.emit(EVENTS.USER_OFFLINE, { userId: payload.userId });
              }
              break;
            default:
              console.log(`Unhandled event type: ${eventType}`);
          }
        } catch (err) {
          console.error('Error processing user activity from Kafka:', err);
        }
      }
    });
    
    console.log('Successfully subscribed to Kafka topics');
    
  } catch (error) {
    console.error('Failed to subscribe to Kafka topics:', error);
    throw error;
  }
}

/**
 * Close all socket connections
 */
async function closeSocketConnections() {
  if (io) {
    // Close socket connections
    const closePromise = new Promise((resolve) => {
      io.close(() => {
        console.log('Socket.IO server closed');
        resolve();
      });
    });

    // Close Kafka consumers
    if (chatConsumer) {
      await chatConsumer.disconnect().catch(console.error);
    }
    
    if (activityConsumer) {
      await activityConsumer.disconnect().catch(console.error);
    }

    await closePromise;
  }
}

module.exports = {
  initializeSocketServer,
  subscribeToKafkaTopics,
  closeSocketConnections,
  EVENTS
};
