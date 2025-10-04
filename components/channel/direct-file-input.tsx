"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Image, Film, FileText, Loader } from "lucide-react";
import axios from "axios";

export type FileType = "image" | "video" | "pdf" | "any";

export interface UploadedFile {
  url: string;
  fileName: string;
  fileType: FileType;
}

interface DirectFileInputProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

const DirectFileInput = ({
  onUploadComplete,
  onUploadError,
  maxSizeMB = 20,
  disabled = false,
}: DirectFileInputProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setProgress(0);
    
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const uploadedFiles: UploadedFile[] = [];
    
    // Check for file size limits
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      const errorMessage = `${oversizedFiles.length} file(s) exceed the maximum size of ${maxSizeMB}MB.`;
      onUploadError?.(errorMessage);
      return;
    }
    
    setUploading(true);
    
    try {
      let completed = 0;
      const totalFiles = files.length;
      
      // Process each file
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        
        // Determine file type
        let fileType: FileType = "any";
        if (file.type.startsWith("image/")) fileType = "image";
        else if (file.type.startsWith("video/")) fileType = "video";
        else if (file.type === "application/pdf") fileType = "pdf";
        
        formData.append("type", fileType);
        
        try {
          // Upload to server
          const response = await axios.post('/api/files', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          
          uploadedFiles.push({
            url: response.data.url,
            fileName: response.data.objectName,
            fileType
          });
          
          // Update progress
          completed++;
          setProgress(Math.round((completed / totalFiles) * 100));
          
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
      
      // Call the completion handler with all successfully uploaded files
      if (uploadedFiles.length > 0) {
        onUploadComplete(uploadedFiles);
      }
      
      // Show error if some files failed
      if (uploadedFiles.length < files.length) {
        const errorMessage = `${files.length - uploadedFiles.length} file(s) failed to upload.`;
        onUploadError?.(errorMessage);
      }
      
    } catch (error) {
      console.error("Error in upload process:", error);
      onUploadError?.("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/*,video/*,application/pdf"
        multiple
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || disabled}
        variant="ghost"
        size="icon"
        className="h-9 w-9 relative"
        type="button"
      >
        {uploading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
        
        {uploading && (
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-xs text-white px-2 py-0.5 rounded">
            {progress}%
          </span>
        )}
      </Button>
    </div>
  );
};

export default DirectFileInput;
