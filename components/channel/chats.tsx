"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { MessageState, useMessageStore } from "@/hooks/use-message-store";
import { MessageSkeletonGroup } from "../skelton/MessageSkelton";
import { Button } from "../ui/button";
import { Chat } from "./chat";
import { ChannelMessage } from "@prisma/client";
import { useSocketStore } from "@/lib/socket-client";

export const ChannelChat = ({ channelId, serverId }: { channelId: number, serverId: string }) => {
  const {
    messages,
    getMessages,
    addMessage,
    messageLoading,
    page,
    incrementPage,
    setEditedChat,
    deleteMessageFromChat,
  }: MessageState = useMessageStore();

  const { socket, isConnected, connect, joinChannel } = useSocketStore();
  const [isTyping, setIsTyping] = useState<{ userId: string, timestamp: number } | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const chatContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    connect(token);
  }, [connect]);
  
  // Load initial messages
  useEffect(() => {
    getMessages({ channelId });
  }, [channelId, getMessages]);
  
  // Handle reconnection
  useEffect(() => {
    if (!isConnected && reconnectAttempts < 5) {
      const timer = setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          console.log(`Attempting to reconnect (${reconnectAttempts + 1}/5)...`);
          connect(token);
          setReconnectAttempts(prev => prev + 1);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    if (isConnected) {
      setReconnectAttempts(0);
    }
  }, [isConnected, reconnectAttempts, connect]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  
  // Join channel and set up event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Join the channel
    joinChannel(serverId, channelId);
    
    // Event handlers
    const handleNewMessage = (message: any) => {
      console.log('New message received:', message);
      try {
        // Make sure we're using the correct property based on the server response
        const msgChannelId = message.channelId || message.channel_id || 
                            (message.channel && message.channel.id);
        
        if (msgChannelId == channelId) {
          addMessage(message);
        }
      } catch (error) {
        console.error('Error handling new message:', error, message);
      }
    };
    
    const handleEditedMessage = (message: any) => {
      console.log('Message edited:', message);
      if (message.channelId === channelId) {
        setEditedChat(message);
      }
    };
    
    const handleDeletedMessage = (messageId: string) => {
      console.log('Message deleted:', messageId);
      deleteMessageFromChat(messageId);
    };
    
    const handleUserTyping = (data: { userId: string, channelId: number }) => {
      if (data.channelId === channelId) {
        setIsTyping({ userId: data.userId, timestamp: Date.now() });
        
        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(null);
        }, 3000);
      }
    };
    
    // Register event listeners
    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleEditedMessage);
    socket.on('message:deleted', handleDeletedMessage);
    socket.on('user:typing', handleUserTyping);
    
    return () => {
      // Remove event listeners
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleEditedMessage);
      socket.off('message:deleted', handleDeletedMessage);
      socket.off('user:typing', handleUserTyping);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, isConnected, channelId, serverId, addMessage, joinChannel, setEditedChat, deleteMessageFromChat]);

  return (
    <div
      className="w-full h-full flex flex-col overflow-auto text-white"
      ref={chatContainerRef}
    >
      {/* Connection status indicator */}
      {!isConnected && (
        <div className="sticky top-0 w-full bg-amber-600 text-white text-center py-1 text-xs">
          Connection lost. {reconnectAttempts < 5 ? "Reconnecting..." : "Please refresh the page."}
        </div>
      )}
      
      <div className="flex flex-col mt-auto gap-4 w-full">
        {messageLoading && <MessageSkeletonGroup />}

        {messages.length >= 10 && !messageLoading && (
          <Button
            size="sm"
            onClick={() => {
              incrementPage();
              getMessages({ channelId, page: page + 1 });
            }}
            className="mx-auto text-xs hover:bg-zinc-800 mt-2 bg-transparent border border-zinc-700"
          >
            Load More
          </Button>
        )}

        {messages.length > 0 &&
          messages?.map((m: any) => (
            <Chat chat={m as ChannelMessage} key={m.id} />
          ))}
          
        {/* Typing indicator */}
        {isTyping && (
          <div className="px-5 text-xs text-zinc-400 italic">
            Someone is typing...
          </div>
        )}
      </div>
    </div>
  );
};
