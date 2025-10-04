"use client";

import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

// Socket store that persists socket instance and connection state across components
interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  joinServer: (serverId: string) => void;
  joinChannel: (serverId: string, channelId: number) => void;
  emitTyping: (serverId: string, channelId: number) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  
  connect: (token: string) => {
    // Don't try to connect with JWT_SECRET by mistake
    if (token === process.env.JWT_SECRET || 
        token === '44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b') {
      console.error('Invalid token provided (appears to be JWT_SECRET). Generating proper token...');
      
      // Generate a proper token instead
      fetch('/api/auth/token')
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            console.log('Using newly generated token instead');
            localStorage.setItem('token', data.token);
            
            // Now connect with the proper token
            const { connect } = get();
            connect(data.token);
          }
        })
        .catch(err => {
          console.error('Failed to get token:', err);
        });
      
      return; // Don't proceed with invalid token
    }
    
    // Check if already connected or connecting
    const { socket: existingSocket, isConnected } = get();
    if (existingSocket && (isConnected || existingSocket.connected)) {
      console.log('Socket already connected or connecting, skipping new connection');
      return;
    }
    
    // Always disconnect previous socket if it exists
    if (existingSocket) {
      console.log('Disconnecting previous socket connection');
      existingSocket.disconnect();
    }

    // Always connect directly to the main socket server
    // The main server.js initializes the socket server on the same port
    const socketUrl = typeof window !== 'undefined' ? 
      window.location.hostname + (window.location.port ? `:${window.location.port}` : '') : 
      'localhost:3000';
    
    const socketOptions = {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
    };
    
    console.log('Connecting to socket server at:', socketUrl);
    
    // Connect to socket server - with debug logging
    console.log('Socket connection options:', socketOptions);
    console.log('Socket connecting to:', `http://${socketUrl}`);
    
    // Connect directly to the main socket server
    const socket = io(`http://${socketUrl}`, socketOptions);
    
    socket.on('connect', () => {
      console.log('Socket connected!');
      set({ isConnected: true });
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected! Reason:', reason);
      set({ isConnected: false });
      
      // If the disconnection was not initiated by the client, attempt to reconnect
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        console.log('Server disconnected the socket, attempting to reconnect...');
        socket.connect();
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ isConnected: false });
    });
    
    socket.io.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
    });
    
    socket.io.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnect attempt ${attemptNumber}`);
    });
    
    socket.io.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
    
    socket.io.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
    });
    
    set({ socket });
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
  
  joinServer: (serverId: string) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('join_server', { serverId });
    } 
  },
  
  joinChannel: (serverId: string, channelId: number) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('join_channel', { serverId, channelId });
    }
  },
  
  emitTyping: (serverId: string, channelId: number) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('user_typing', { serverId, channelId });
    }
  },
}));
