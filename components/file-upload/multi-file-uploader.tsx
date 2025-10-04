"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Upload, AlertCircle, Loader } from "lucide-react";

export type FileType = "image" | "video" | "pdf" | "any";

interface UploadedFile {
  url: string;
  fileName: string;
  fileType: FileType;
}

interface MultiFileUploaderProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  buttonText?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  disabled?: boolean;
  accept?: string;
}

const MultiFileUploader = ({
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
  buttonText = "Upload Files",
  className = "",
  variant = "outline",
  size = "default",
  showIcon = true,
  disabled = false,
  accept = "image/*,video/*,application/pdf"
}: MultiFileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setProgress(0);
    
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const uploadedFiles: UploadedFile[] = [];
    
    // Check for file size limits
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      const errorMessage = `${oversizedFiles.length} file(s) exceed the maximum size of ${maxSizeMB}MB.`;
      setError(errorMessage);
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
        setError(errorMessage);
        onUploadError?.(errorMessage);
      }
      
    } catch (error) {
      console.error("Error in upload process:", error);
      const errorMessage = "Failed to upload files. Please try again.";
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
        accept={accept}
        multiple
        className="hidden"
        data-testid="multi-file-input"
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
            <Loader className="h-4 w-4 animate-spin" />
            <span>Uploading... {progress}%</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {showIcon && <Upload className="h-4 w-4" />}
            <span>{buttonText}</span>
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

export default MultiFileUploader;
