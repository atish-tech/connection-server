"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { UserRound, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSocketStore } from '@/lib/socket-client';

interface OnlineStatusIndicatorProps {
  serverId?: string;
  channelId?: number;
}

export function OnlineStatusIndicator({ serverId, channelId }: OnlineStatusIndicatorProps) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [onlineCount, setOnlineCount] = useState<number>(0);

  // Use the socket store for connection management
  const { socket, isConnected, connect, joinServer, joinChannel } = useSocketStore();
  
  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to socket server
    connect(token);
    
    // Clean up function is handled by the component unmount
    return () => {
      // Socket instance is maintained by the store
     
    };
  }, [connect]);
  
  // Set up event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Handle presence updates
    const handlePresenceUpdate = ({ userId, status, count }: { userId: string, status: string, count: number }) => {
      console.log('Presence update received:', { userId, status, count });
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
      
      // Update global online count
      if (!serverId && !channelId) {
        setOnlineCount(count);
      }
    };
    
    // Handle server online count updates
    const handleServerCount = ({ serverId: sId, count }: { serverId: string, count: number }) => {
      console.log('Server count update:', { serverId: sId, count });
      if (serverId === sId) {
        setOnlineCount(count);
      }
    };
    
    // Handle channel online count updates
    const handleChannelCount = ({ channelId: cId, count }: { channelId: number, count: number }) => {
      console.log('Channel count update:', { channelId: cId, count });
      if (channelId === cId) {
        setOnlineCount(count);
      }
    };
    
    // Register event listeners
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('server:online_count', handleServerCount);
    socket.on('channel:online_count', handleChannelCount);
    
    // Fetch initial count via API
    const fetchInitialCount = async () => {
      try {
        let endpoint = '/api/user/online-status';
        if (channelId) {
          endpoint += `?channelId=${channelId}`;
        } else if (serverId) {
          endpoint += `?serverId=${serverId}`;
        }
        
        const response = await fetch(endpoint);
        const data = await response.json();
        if (data.count !== undefined) {
          setOnlineCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch online count:', error);
      }
    };
    
    fetchInitialCount();
    
    // Clean up event listeners
    return () => {
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('server:online_count', handleServerCount);
      socket.off('channel:online_count', handleChannelCount);
    };
  }, [socket, isConnected, serverId, channelId]);

  // Join rooms when serverId or channelId changes
  useEffect(() => {
    if (!isConnected) return;
    
    if (serverId) {
      joinServer(serverId);
      console.log('Joining server room:', serverId);
    }
    
    if (serverId && channelId) {
      joinChannel(serverId, channelId);
      console.log('Joining channel room:', channelId);
    }
  }, [isConnected, serverId, channelId, joinServer, joinChannel]);

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 h-8 bg-zinc-800/90 hover:bg-zinc-700/90"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Users className="h-4 w-4 text-zinc-400" />
                <span className="absolute -top-1.5 -right-2 text-xs font-semibold bg-green-600 text-white rounded-full px-1.5 min-w-[20px] text-center">
                  {onlineCount}
                </span>
              </div>
              <span className="text-xs text-zinc-300">Online</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="bottom" 
          className="w-48 p-2 bg-zinc-800 border-none shadow-md"
        >
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1 text-xs font-medium text-zinc-400">
              Online Users: {onlineCount}
            </div>
            {Array.from(onlineUsers).slice(0, 10).map(userId => (
              <div key={userId} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-700">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-zinc-300 truncate">{userId}</span>
              </div>
            ))}
            {onlineUsers.size > 10 && (
              <div className="text-center text-xs text-zinc-500 mt-1">
                + {onlineUsers.size - 10} more
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function UserOnlineIndicator({ userId, showText = false }: { userId: string, showText?: boolean }) {
  const [isOnline, setIsOnline] = useState(false);
  const { socket, isConnected, connect } = useSocketStore();
  
  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    connect(token);
  }, [connect]);
  
  // Check initial online status and set up event listeners
  useEffect(() => {
    // Check initial online status
    const fetchOnlineStatus = async () => {
      try {
        const res = await fetch(`/api/user/online-status?userId=${userId}`);
        const data = await res.json();
        if (data.isOnline !== undefined) {
          setIsOnline(data.isOnline);
        }
      } catch (err) {
        console.error('Error fetching online status:', err);
      }
    };
    
    fetchOnlineStatus();
    
    // Set up event listener for presence updates
    if (socket && isConnected) {
      const handlePresenceUpdate = ({ userId: uid, status }: { userId: string, status: string }) => {
        if (uid === userId) {
          setIsOnline(status === 'online');
        }
      };
      
      socket.on('presence:update', handlePresenceUpdate);
      
      return () => {
        socket.off('presence:update', handlePresenceUpdate);
      };
    }
  }, [socket, isConnected, userId]);
  
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-zinc-500'} transition-colors duration-300`} />
      {showText && (
        <span className="text-xs text-zinc-400">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}
