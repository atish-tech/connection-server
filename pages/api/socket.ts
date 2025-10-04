import { Server } from "socket.io";
import { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { decodeToken } from '@/config/decodeToken';
import { initKafka } from '@/utils/kafka';
import redisClient from '@/utils/redis-api';

// Define a custom response type that includes socket.io
export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io: Server;
    };
  };
};

// Store connections info
const connectionsByUser = new Map<string, string[]>();
// Store online users
const onlineUsers = new Set<string>();

// Simple function to record user online in Redis
async function markUserOnline(userId: string) {
  try {
    const key = `user:presence:${userId}`;
    await redisClient.set(key, JSON.stringify({
      isOnline: true, 
      lastSeen: new Date().toISOString(),
    }), 'EX', 60); // 60 second TTL
    
    // Also add to global online set
    await redisClient.sadd('online:users', userId);
    
    // Store in local set too
    onlineUsers.add(userId);
  } catch (err) {
    console.error('Error marking user online:', err);
  }
}

// Simple function to record user offline in Redis
async function markUserOffline(userId: string) {
  try {
    // Delete presence key
    await redisClient.del(`user:presence:${userId}`);
    // Remove from online set
    await redisClient.srem('online:users', userId);
    
    // Remove from local set
    onlineUsers.delete(userId);
  } catch (err) {
    console.error('Error marking user offline:', err);
  }
}

// Simple function to get online user count
async function getOnlineCount() {
  try {
    // First try Redis
    const count = await redisClient.scard('online:users');
    return count;
  } catch (err) {
    // Fallback to local count
    console.error('Error getting online count:', err);
    return onlineUsers.size;
  }
}

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // Check if socket.io server is already initialized
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.io server');
  
  // Skip Redis connection check in API routes
  // We'll handle Redis errors more gracefully in the application
  
  // Initialize Kafka if available
  if (process.env.KAFKA_AVAILABLE === 'true') {
    try {
      await initKafka();
      console.log('Kafka initialized successfully');
    } catch (error) {
      console.error('Kafka initialization error:', error);
    }
  }
  
  // Initialize socket.io server
  const io = new Server(res.socket.server as any, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['content-type', 'authorization'],
    },
    transports: ['polling', 'websocket'], // Use polling first, then upgrade to websocket
    pingTimeout: 60000,
    connectTimeout: 45000,
    allowEIO3: true, // Allow Engine.IO v3 client to connect
  });

  // Store socket.io instance
  res.socket.server.io = io;

  // Connection event handling
  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    try {
      // Extract user info from socket handshake auth
      const token = socket.handshake.auth.token as string;
      console.log(`Socket auth token received: ${token ? token.substring(0, 15) + '...' : 'none'}`);
      
      if (!token) {
        console.log('No token provided, disconnecting socket');
        socket.disconnect();
        return;
      }

      // Decode JWT token
      let decoded;
      try {
        decoded = await decodeToken(token);
        if (!decoded) {
          console.log('Invalid token (null result), disconnecting socket');
          socket.disconnect();
          return;
        }
        console.log(`Token decoded successfully, user ID: ${decoded}`);
      } catch (tokenError) {
        console.error('Token decoding failed:', tokenError);
        socket.disconnect();
        return;
      }

      const userId = decoded.toString();
      
      // Associate socket with user
      socket.data.userId = userId;
      
      // Track connection
      const userConnections = connectionsByUser.get(userId) || [];
      userConnections.push(socket.id);
      connectionsByUser.set(userId, userConnections);
      
      // Join user's personal room
      socket.join(`user:${userId}`);
      
      // Mark user as online using our simplified function
      try {
        await markUserOnline(userId);
        
        // Emit online status update
        const count = await getOnlineCount();
        io.emit('presence:update', {
          userId,
          status: 'online',
          count
        });
      } catch (presenceErr) {
        console.error('Error handling user presence:', presenceErr);
      }
      
      // Setup heartbeat to keep user online
      const heartbeatInterval = setInterval(async () => {
        try {
          const key = `user:presence:${userId}`;
          await redisClient.set(key, JSON.stringify({
            isOnline: true, 
            lastSeen: new Date().toISOString(),
          }), 'EX', 60); // 60 second TTL
        } catch (err) {
          console.error('Heartbeat error:', err);
        }
      }, 30000);
      
      // Join server room
      socket.on('server:join', async (serverId: string) => {
        try {
          console.log(`User ${userId} joining server: ${serverId}`);
          // Leave previous server rooms
          const rooms = Array.from(socket.rooms);
          rooms.forEach(room => {
            if (room.startsWith('server:') && room !== `server:${serverId}`) {
              socket.leave(room);
            }
          });
          
          // Join new server room
          socket.join(`server:${serverId}`);
          
          // Store server ID in user presence
          const key = `user:presence:${userId}`;
          try {
            const data = await redisClient.get(key);
            const presence = data ? JSON.parse(data) : { isOnline: true };
            presence.serverId = serverId;
            presence.lastSeen = new Date().toISOString();
            await redisClient.set(key, JSON.stringify(presence), 'EX', 60);
          } catch (err) {
            console.error('Error updating server presence:', err);
          }
          
          // Emit count update (simplified)
          io.to(`server:${serverId}`).emit('server:online_count', {
            serverId,
            count: onlineUsers.size
          });
        } catch (err) {
          console.error('Error handling server join:', err);
        }
      });
      
      // Join channel room
      socket.on('channel:join', async ({ serverId, channelId }: { serverId: string, channelId: number }) => {
        try {
          console.log(`User ${userId} joining channel: ${channelId} in server: ${serverId}`);
          // Leave previous channel rooms
          const rooms = Array.from(socket.rooms);
          rooms.forEach(room => {
            if (room.startsWith('channel:') && room !== `channel:${channelId}`) {
              socket.leave(room);
            }
          });
          
          // Join new channel room
          socket.join(`channel:${channelId}`);
          
          // Store channel ID in user presence
          const key = `user:presence:${userId}`;
          try {
            const data = await redisClient.get(key);
            const presence = data ? JSON.parse(data) : { isOnline: true };
            presence.serverId = serverId;
            presence.channelId = channelId;
            presence.lastSeen = new Date().toISOString();
            await redisClient.set(key, JSON.stringify(presence), 'EX', 60);
          } catch (err) {
            console.error('Error updating channel presence:', err);
          }
          
          // Emit count update (simplified)
          io.to(`channel:${channelId}`).emit('channel:online_count', {
            channelId,
            count: onlineUsers.size
          });
        } catch (err) {
          console.error('Error handling channel join:', err);
        }
      });
      
      // User typing event
      socket.on('user:typing', ({ channelId }: { channelId: number }) => {
        socket.to(`channel:${channelId}`).emit('user:typing', {
          userId,
          channelId
        });
      });

      // New message event
      socket.on('message:send', (message) => {
        io.to(`channel:${message.channelId}`).emit('message:new', message);
      });
      
      // Disconnect event
      socket.on('disconnect', async () => {
        try {
          console.log(`Socket disconnected: ${socket.id} (User: ${userId})`);
          clearInterval(heartbeatInterval);
          
          // Remove from connections tracking
          const userConnections = connectionsByUser.get(userId) || [];
          const updatedConnections = userConnections.filter(id => id !== socket.id);
          
          if (updatedConnections.length === 0) {
            // Last connection for this user is gone, mark as offline
            connectionsByUser.delete(userId);
            
            // Mark user as offline
            await markUserOffline(userId);
            
            // Emit online status update
            const count = await getOnlineCount();
            io.emit('presence:update', {
              userId,
              status: 'offline',
              count
            });
          } else {
            // User still has other connections, update the list
            connectionsByUser.set(userId, updatedConnections);
          }
        } catch (err) {
          console.error('Error handling disconnect:', err);
        }
      });
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.disconnect();
    }
  });

  console.log('Socket.io server initialized');
  res.end();
};

export default SocketHandler;