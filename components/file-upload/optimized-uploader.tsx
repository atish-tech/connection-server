"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Upload, AlertCircle } from "lucide-react";

export type FileType = "image" | "video" | "pdf" | "any";

interface OptimizedUploaderProps {
  fileType: FileType;
  onUploadComplete: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  buttonText?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  disabled?: boolean;
}

const allowedTypes: Record<FileType, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  pdf: ["application/pdf"],
  any: []
};

const OptimizedUploader = ({
  fileType,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
  buttonText,
  className = "",
  variant = "outline",
  size = "default",
  showIcon = true,
  disabled = false
}: OptimizedUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const getButtonText = () => {
    if (buttonText) return buttonText;
    if (uploading) return "Uploading...";
    
    switch (fileType) {
      case "image": return "Upload Image";
      case "video": return "Upload Video";
      case "pdf": return "Upload PDF";
      default: return "Upload File";
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file size
    if (file.size > maxSizeBytes) {
      const errorMessage = `File too large. Maximum size is ${maxSizeMB}MB.`;
      setError(errorMessage);
      onUploadError?.(errorMessage);
      return;
    }

    // Validate file type
    if (fileType !== "any" && !allowedTypes[fileType].includes(file.type)) {
      const errorMessage = `Invalid file type. Allowed types: ${allowedTypes[fileType].join(", ")}`;
      setError(errorMessage);
      onUploadError?.(errorMessage);
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileType);
    
    try {
      // Use the unified files API endpoint
      const response = await axios.post('/api/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // The response already includes the URL
      onUploadComplete(response.data.url, response.data.objectName);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = "Failed to upload file. Please try again.";
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={fileType !== "any" ? allowedTypes[fileType].join(",") : undefined}
        className="hidden"
        data-testid="file-input"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || disabled}
        variant={variant}
        size={size}
        className={className}
      >
        {uploading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {showIcon && <Upload className="h-4 w-4" />}
            <span>{getButtonText()}</span>
          </div>
        )}
      </Button>
      
      {error && (
        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedUploader;
