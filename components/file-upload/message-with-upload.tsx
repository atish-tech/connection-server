"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paperclip, Send, X, Image, FileText, Film } from "lucide-react";
import OptimizedUploader from "@/components/file-upload/optimized-uploader";

interface MessageWithUploadProps {
  onSendMessage?: (text: string, attachmentUrl?: string, attachmentType?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxAttachmentSizeMB?: number;
}

export default function MessageWithUpload({
  onSendMessage = () => {},
  placeholder = "Type a message...",
  disabled = false,
  className = "",
  maxAttachmentSizeMB = 10
}: MessageWithUploadProps) {
  const [messageText, setMessageText] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);

  const handleSend = () => {
    if (messageText.trim() || attachment) {
      onSendMessage(messageText, attachment?.url, attachment?.type);
      setMessageText("");
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (fileUrl: string, fileName: string, fileType: string) => {
    setAttachment({
      url: fileUrl,
      name: fileName,
      type: fileType
    });
    setUploadMenuOpen(false);
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Attachment preview */}
      {attachment && (
        <div className="bg-muted rounded-md p-2 mb-2 flex items-center justify-between">
          <div className="flex items-center">
            {attachment.type === "image" && <Image className="w-4 h-4 mr-2" />}
            {attachment.type === "video" && <Film className="w-4 h-4 mr-2" />}
            {attachment.type === "pdf" && <FileText className="w-4 h-4 mr-2" />}
            <span className="text-sm truncate max-w-[200px]">{attachment.name.split('-').pop()}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={removeAttachment} 
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Message input and actions */}
      <div className="flex items-center gap-2">
        <Popover open={uploadMenuOpen} onOpenChange={setUploadMenuOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button" 
              size="icon" 
              variant="ghost"
              disabled={disabled}
              className="h-9 w-9"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-[200px] p-2">
            <div className="flex flex-col gap-2">
              <OptimizedUploader
                fileType="image"
                onUploadComplete={(url, name) => handleFileUpload(url, name, "image")}
                buttonText="Image"
                className="w-full justify-start"
                showIcon={true}
                maxSizeMB={maxAttachmentSizeMB}
              />
              <OptimizedUploader
                fileType="video"
                onUploadComplete={(url, name) => handleFileUpload(url, name, "video")}
                buttonText="Video"
                className="w-full justify-start"
                showIcon={true}
                maxSizeMB={maxAttachmentSizeMB}
              />
              <OptimizedUploader
                fileType="pdf"
                onUploadComplete={(url, name) => handleFileUpload(url, name, "pdf")}
                buttonText="PDF Document"
                className="w-full justify-start"
                showIcon={true}
                maxSizeMB={maxAttachmentSizeMB}
              />
            </div>
          </PopoverContent>
        </Popover>
        
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        
        <Button
          onClick={handleSend}
          disabled={disabled || (!messageText.trim() && !attachment)}
          size="icon"
          className="h-9 w-9"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
