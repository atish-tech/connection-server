"use client";

import { useEffect, useState } from "react";
import { useSocketStore } from "@/lib/socket-client";
import { toast } from "sonner";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { connect, isConnected } = useSocketStore();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [statusChecked, setStatusChecked] = useState(false);

  // Initialize Socket.IO when app loads
  useEffect(() => {
    // Initialize the socket connection
    const initSocket = async () => {
      // First check if we have an invalid token stored
      const storedToken = localStorage.getItem('token');
      if (storedToken === process.env.JWT_SECRET || 
          storedToken === '44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b') {
        // Remove invalid token
        console.log('Removing invalid token from localStorage');
        localStorage.removeItem('token');
        
        // Get a new token
        try {
          const tokenResponse = await fetch('/api/auth/token');
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData.token) {
              console.log('Stored new token in localStorage');
              localStorage.setItem('token', tokenData.token);
              toast.success('Generated new authentication token');
            }
          }
        } catch (tokenError) {
          console.error('Failed to get new token:', tokenError);
        }
      }
      
      try {
        // Check if API and services are available
        try {
          const statusResponse = await fetch('/api/status');
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('Service status before connection:', statusData);
            
            // Show warnings for any services that are down
            if (!statusData.status.redis.connected) {
              toast.warning("Redis service issue detected. Some features may be limited.");
            }
          }
        } catch (statusError) {
          console.warn('Status check failed:', statusError);
        }
        
        // Ensure the socket endpoint is ready - with retry logic
        let socketEndpointReady = false;
        let attempts = 0;
        
        while (!socketEndpointReady && attempts < 3) {
          try {
            const response = await fetch('/api/socket');
            if (response.ok) {
              socketEndpointReady = true;
              console.log('Socket API ready on attempt', attempts + 1);
            } else {
              console.warn(`Socket API not ready (${response.status}), retrying...`);
              await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
            }
          } catch (fetchError) {
            console.warn('Socket API fetch failed, retrying...', fetchError);
            await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
          }
          attempts++;
        }
        
        if (!socketEndpointReady) {
          console.error('Socket API route not available after retries');
          toast.error("Cannot connect to socket server. Please refresh the page.");
          return;
        }
        
        // Get token from local storage
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found for socket authentication');
          toast.error("Authentication required. Please log in again.");
          return;
        }
        
        // Connect to socket server
        console.log('Initializing socket connection with token');
        connect(token);
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        toast.error("Connection error. Please reload the page.");
      }
    };
    
    initSocket();
  }, [connect]);
  
  // Handle reconnection
  useEffect(() => {
    if (isConnected) {
      // Reset reconnect attempts when connected
      if (reconnectAttempts > 0) {
        setReconnectAttempts(0);
        toast.success("Reconnected to server!");
      }
    } else if (!statusChecked) {
      // Check service status on initial load or disconnection
      fetch('/api/status')
        .then(res => res.json())
        .then(data => {
          console.log("Service status:", data);
          const { redis, kafka } = data.status;
          
          if (!redis.connected) {
            // Handle Redis connection issue more gracefully
            console.error(`Redis connection issue: ${redis.message}`);
            toast.error("Connection issue detected. Trying to recover...");
            
            // Attempt recovery by refreshing the status every few seconds
            const recoveryInterval = setInterval(() => {
              fetch('/api/status')
                .then(res => res.json())
                .then(refreshData => {
                  if (refreshData.status.redis.connected) {
                    toast.success("Connection recovered successfully!");
                    clearInterval(recoveryInterval);
                    
                    // Try to reconnect socket
                    const token = localStorage.getItem('token');
                    if (token) {
                      connect(token);
                    }
                  }
                })
                .catch(() => {
                  console.log("Still trying to recover connection...");
                });
            }, 5000); // Check every 5 seconds
            
            // Clear the interval after 30 seconds if not recovered
            setTimeout(() => {
              clearInterval(recoveryInterval);
            }, 30000);
          }
          
          if (kafka.message !== 'Kafka is disabled in configuration' && !kafka.connected) {
            toast.error(`Kafka connection issue: ${kafka.message}`);
          }
          
          setStatusChecked(true);
        })
        .catch(err => {
          console.error("Error checking service status:", err);
        });
    }
  }, [isConnected, reconnectAttempts, statusChecked, connect]);
  
  // Setup periodic reconnection attempts if disconnected
  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    
    if (!isConnected) {
      reconnectTimer = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token) {
          setReconnectAttempts(prev => prev + 1);
          console.log(`Reconnect attempt ${reconnectAttempts + 1}`);
          connect(token);
          
          // Show toast every 3 attempts
          if ((reconnectAttempts + 1) % 3 === 0) {
            toast.info(`Attempting to reconnect... (Try ${reconnectAttempts + 1})`);
          }
        }
      }, 5000); // Try every 5 seconds
    }
    
    return () => {
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
      }
    };
  }, [isConnected, reconnectAttempts, connect]);
  
  return <>{children}</>;
};

export default SocketProvider;

