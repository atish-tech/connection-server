"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, Image, FileText, Film } from "lucide-react";
import { MessageState, useMessageStore } from "@/hooks/use-message-store";
import { ChannelMessageType } from "@prisma/client";
import DirectFileInput, { UploadedFile } from "./direct-file-input";
import { toast } from "sonner";
import { useSocketStore } from "@/lib/socket-client";

interface MessageInputWithUploadProps {
  channelId: number;
  serverId: string;
}

export const MessageInputWithUpload = ({ channelId, serverId }: MessageInputWithUploadProps) => {
  const [messageText, setMessageText] = useState<string>("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const { loading, sendMessage }: MessageState = useMessageStore();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { socket, isConnected, connect, emitTyping } = useSocketStore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }
    
    console.log("Initializing socket connection");
    connect(token);
    
    // Create a reconnect interval if needed
    const reconnectInterval = setInterval(() => {
      if (!isConnected) {
        console.log("Not connected, attempting to reconnect...");
        connect(token);
      }
    }, 10000); // Check every 10 seconds
    
    // Check service status
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        console.log("Service status:", data);
        if (!data.status.redis.connected) {
          toast.error("Redis connection issue: " + data.status.redis.message);
        }
        if (!data.status.kafka.connected && data.status.kafka.message !== 'Kafka is disabled in configuration') {
          toast.error("Kafka connection issue: " + data.status.kafka.message);
        }
      })
      .catch(err => {
        console.error("Error fetching service status:", err);
      });
    
    return () => {
      clearInterval(reconnectInterval);
    };
  }, [connect, isConnected]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // If there are no attachments, send as a regular text message
    if (attachments.length === 0 && messageText.trim()) {
      sendMessage({
        message: messageText,
        messageType: ChannelMessageType.TEXT,
        setMessage: setMessageText,
        channelId,
        serverId,
        e,
      });
      return;
    }
    
    // Handle attachments
    if (attachments.length > 0) {
      // For simplicity, we'll send the first attachment with the message
      // and then send any additional attachments separately
      const firstAttachment = attachments[0];
      let messageType: ChannelMessageType;
      
      switch (firstAttachment.fileType) {
        case "image":
          messageType = ChannelMessageType.IMAGE;
          break;
        case "video":
          messageType = ChannelMessageType.VIDEO;
          break;
        case "pdf":
          messageType = ChannelMessageType.PDF;
          break;
        default:
          messageType = ChannelMessageType.TEXT;
      }
      
      // Send first attachment with message text
      sendMessage({
        message: firstAttachment.url + (messageText ? `|${messageText}` : ""),
        messageType,
        setMessage: setMessageText,
        channelId,
        serverId,
        e,
      });
      
      // Send any additional attachments
      for (let i = 1; i < attachments.length; i++) {
        const attachment = attachments[i];
        let attachmentType: ChannelMessageType;
        
        switch (attachment.fileType) {
          case "image":
            attachmentType = ChannelMessageType.IMAGE;
            break;
          case "video":
            attachmentType = ChannelMessageType.VIDEO;
            break;
          case "pdf":
            attachmentType = ChannelMessageType.PDF;
            break;
          default:
            attachmentType = ChannelMessageType.TEXT;
        }
        
        // Use setTimeout to stagger the messages
        setTimeout(() => {
          sendMessage({
            message: attachment.url,
            messageType: attachmentType,
            setMessage: () => {}, // Empty setter
            channelId,
            serverId,
            e: { preventDefault: () => {} } as any,
          });
        }, i * 300);
      }
      
      // Clear attachments after sending
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
    }
  };
  
  // Emit typing event
  const handleTyping = () => {
    if (!isConnected) return;
    
    emitTyping(channelId);
    
    // Debounce typing events
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFilesUpload = (files: UploadedFile[]) => {
    setAttachments([...attachments, ...files]);
    setUploadError(null);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    toast.error(error);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image": return <Image className="w-4 h-4 mr-2" />;
      case "video": return <Film className="w-4 h-4 mr-2" />;
      case "pdf": return <FileText className="w-4 h-4 mr-2" />;
      default: return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <div className="w-full mt-4 px-5 pb-5">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="bg-zinc-800 rounded-md p-3 mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="bg-zinc-700 rounded-md p-2 flex items-center justify-between w-fit">
              <div className="flex items-center">
                {getFileIcon(file.fileType)}
                <span className="text-sm truncate max-w-[140px]">
                  {file.fileName.split('-').pop()?.substring(0, 15)}
                  {(file.fileName.split('-').pop()?.length || 0) > 15 ? '...' : ''}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeAttachment(index)} 
                className="h-6 w-6 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <form 
        onSubmit={handleSend}
        className="flex items-center bg-zinc-800 p-4 rounded-md gap-3"
      >
        <DirectFileInput 
          onUploadComplete={handleFilesUpload}
          onUploadError={handleUploadError}
          disabled={loading}
          maxSizeMB={20}
        />
        
        <Input
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={loading || !isConnected}
          className="bg-zinc-800 w-full border-none focus:outline-none focus:border-none"
        />
        
        <Button
          type="submit"
          disabled={loading || (messageText.trim() === "" && attachments.length === 0)}
          size="icon"
          variant="ghost"
          className="h-9 w-9"
        >
          {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  );
};

export default MessageInputWithUpload;
