import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Consumer } from 'kafkajs';
import { createConsumer, MessageEventType, KafkaMessage } from './kafka';
import { 
  setUserOnline, 
  setUserOffline, 
  keepUserOnline, 
  updateUserPresence,
  getOnlineUserCount
} from './redis';
import { DB as prisma } from '@/lib/prisma';
import { decodeTokenServer } from '@/lib/jwt-server';

// Map to store consumer instances
const consumers: Record<string, Consumer> = {};

// Socket.io instance
let io: Server;

// Initialize Socket.IO server
export function initializeSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['content-type', 'authorization'],
    },
    transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
    pingTimeout: 60000,
    connectTimeout: 45000,
    allowEIO3: true, // Allow Engine.IO v3 client to connect
  });

  // Connection event handling
  io.on('connection', async (socket: Socket) => {
    // Extract user info from socket handshake auth
    const token = socket.handshake.auth.token as string;
    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      // Decode JWT token
      const decoded = await decodeTokenServer(token);
      if (!decoded || !decoded.id) {
        socket.disconnect();
        return;
      }

      const userId = decoded.id;
      
      // Associate socket with user
      socket.data.userId = userId;
      
      // Join user's personal room
      socket.join(`user:${userId}`);
      
      // Mark user as online
      await setUserOnline(userId);
      
      // Emit online status update
      io.emit('presence:update', {
        userId,
        status: 'online',
        count: await getOnlineUserCount()
      });
      
      // Setup heartbeat to keep user online
      const heartbeatInterval = setInterval(() => {
        keepUserOnline(userId);
      }, 30000);
      
      // Join server room
      socket.on('server:join', async (serverId: string) => {
        // Leave previous server rooms
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
          if (room.startsWith('server:') && room !== `server:${serverId}`) {
            socket.leave(room);
          }
        });
        
        // Join new server room
        socket.join(`server:${serverId}`);
        
        // Update user presence
        await updateUserPresence(userId, serverId);
        
        // Emit updated online count for the server
        const onlineCount = await getOnlineUserCount(serverId);
        io.to(`server:${serverId}`).emit('server:online_count', {
          serverId,
          count: onlineCount
        });
      });
      
      // Join channel room
      socket.on('channel:join', async ({ serverId, channelId }: { serverId: string, channelId: number }) => {
        // Leave previous channel rooms
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
          if (room.startsWith('channel:') && room !== `channel:${channelId}`) {
            socket.leave(room);
          }
        });
        
        // Join new channel room
        socket.join(`channel:${channelId}`);
        
        // Update user presence with channel info
        await updateUserPresence(userId, serverId, channelId);
        
        // Emit updated online count for the channel
        const onlineCount = await getOnlineUserCount(undefined, channelId);
        io.to(`channel:${channelId}`).emit('channel:online_count', {
          channelId,
          count: onlineCount
        });
      });
      
      // User typing event
      socket.on('user:typing', ({ channelId }: { channelId: number }) => {
        socket.to(`channel:${channelId}`).emit('user:typing', {
          userId,
          channelId
        });
      });
      
      // Disconnect event
      socket.on('disconnect', async () => {
        clearInterval(heartbeatInterval);
        
        // Mark user as offline
        await setUserOffline(userId);
        
        // Emit online status update
        io.emit('presence:update', {
          userId,
          status: 'offline',
          count: await getOnlineUserCount()
        });
      });
      
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.disconnect();
    }
  });

  return io;
}

// Function to subscribe to Kafka topics
export async function subscribeToKafkaTopics(): Promise<void> {
  try {
    // Chat message consumer
    const chatConsumer = createConsumer('chat-group');
    await chatConsumer.connect();
    await chatConsumer.subscribe({ topic: 'chat-messages', fromBeginning: false });

    await chatConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        
        try {
          const kafkaMessage: KafkaMessage = JSON.parse(message.value.toString());
          const { eventType, payload, metadata } = kafkaMessage;
          
          switch (eventType) {
            case MessageEventType.NEW_MESSAGE:
              // Save message to database
              const savedMessage = await prisma.channelMessage.create({
                data: {
                  content: payload.content,
                  type: payload.type,
                  channelId: payload.channelId,
                  memberId: payload.memberId,
                  isEdited: false
                },
                include: {
                  members: {
                    include: {
                      user: true
                    }
                  }
                }
              });
              
              // Broadcast to channel
              io.to(`channel:${payload.channelId}`).emit('message:new', savedMessage);
              break;
              
            case MessageEventType.MESSAGE_EDITED:
              // Broadcast edited message
              io.to(`channel:${metadata.channelId}`).emit('message:edited', payload);
              break;
              
            case MessageEventType.MESSAGE_DELETED:
              // Broadcast deleted message
              io.to(`channel:${metadata.channelId}`).emit('message:deleted', payload);
              break;
          }
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      }
    });
    
    // User activity consumer
    const activityConsumer = createConsumer('activity-group');
    await activityConsumer.connect();
    await activityConsumer.subscribe({ topic: 'user-activity', fromBeginning: false });
    
    await activityConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        
        try {
          const kafkaMessage: KafkaMessage = JSON.parse(message.value.toString());
          const { eventType, payload, metadata } = kafkaMessage;
          
          switch (eventType) {
            case MessageEventType.USER_TYPING:
              // Broadcast typing notification
              if (metadata.channelId) {
                io.to(`channel:${metadata.channelId}`).emit('user:typing', {
                  userId: metadata.userId,
                  channelId: metadata.channelId
                });
              }
              break;
              
            case MessageEventType.USER_JOINED:
            case MessageEventType.USER_LEFT:
              // Broadcast user joined/left server
              if (metadata.serverId) {
                io.to(`server:${metadata.serverId}`).emit('server:user_update', {
                  type: eventType,
                  userId: metadata.userId,
                  serverId: metadata.serverId
                });
              }
              break;
          }
        } catch (error) {
          console.error('Error processing Kafka user activity:', error);
        }
      }
    });
    
    // Store consumer instances for cleanup
    consumers['chat-consumer'] = chatConsumer;
    consumers['activity-consumer'] = activityConsumer;
    
    console.log('Kafka consumers initialized and subscribed');
  } catch (error) {
    console.error('Failed to subscribe to Kafka topics:', error);
    throw error;
  }
}

// Get the socket.io instance
export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
}

// Graceful shutdown
export async function closeSocketConnections(): Promise<void> {
  // Disconnect all socket clients
  if (io) {
    const sockets = await io.fetchSockets();
    for (const socket of sockets) {
      socket.disconnect(true);
    }
    io.disconnectSockets();
    io.close();
  }
  
  // Disconnect Kafka consumers
  for (const key in consumers) {
    await consumers[key].disconnect();
  }
}

export default {
  initializeSocketServer,
  subscribeToKafkaTopics,
  getIO,
  closeSocketConnections,
};
