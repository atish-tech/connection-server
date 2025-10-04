"use client";

import { useState } from "react";
import FileUploadDemo from "@/components/file-upload/file-upload-demo";
import MessageWithUpload from "@/components/file-upload/message-with-upload";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function FileUploadDemoPage() {
  const [messages, setMessages] = useState<{text: string; attachment?: string; type?: string}[]>([]);
  
  const handleSendMessage = (text: string, attachmentUrl?: string, attachmentType?: string) => {
    setMessages(prev => [...prev, {
      text,
      attachment: attachmentUrl,
      type: attachmentType
    }]);
    
    // You could also send this to your backend API here
    console.log("Message sent:", { text, attachmentUrl, attachmentType });
  };
  
  return (
    <div className="container mx-auto py-8">
      <FileUploadDemo />
      
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Message With File Upload</CardTitle>
            <CardDescription>Example of file upload integrated with a messaging interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 mb-4 h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 my-12">No messages yet. Send one below!</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((msg, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      {msg.text && <p>{msg.text}</p>}
                      {msg.attachment && msg.type === "image" && (
                        <img 
                          src={msg.attachment} 
                          alt="Attachment" 
                          className="mt-2 max-h-48 rounded-md" 
                        />
                      )}
                      {msg.attachment && msg.type === "video" && (
                        <video 
                          controls 
                          className="mt-2 max-h-48 rounded-md w-full"
                        >
                          <source src={msg.attachment} />
                        </video>
                      )}
                      {msg.attachment && msg.type === "pdf" && (
                        <div className="mt-2">
                          <a 
                            href={msg.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-500 hover:underline"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View PDF attachment
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <MessageWithUpload 
              onSendMessage={handleSendMessage}
              placeholder="Type your message here..."
              maxAttachmentSizeMB={15}
            />
          </CardContent>
        </Card>
      </div>

    
    </div>
  );
}
