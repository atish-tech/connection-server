"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Upload } from "lucide-react";

interface SimpleUploaderProps {
  fileType: "image" | "video" | "pdf" | "any";
  onUploadComplete: (fileUrl: string, fileName: string) => void;
  maxSizeMB?: number;
  buttonText?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const allowedTypes = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  pdf: ["application/pdf"],
  any: []
};

const SimpleUploader = ({
  fileType,
  onUploadComplete,
  maxSizeMB = 10,
  buttonText,
  className = "",
  variant = "outline",
  size = "default"
}: SimpleUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    switch (fileType) {
      case "image": return "Upload Image";
      case "video": return "Upload Video";
      case "pdf": return "Upload PDF";
      default: return "Upload File";
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file size
    if (file.size > maxSizeBytes) {
      console.error(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    // Validate file type
    if (fileType !== "any" && !allowedTypes[fileType].includes(file.type)) {
      console.error(`Invalid file type. Allowed types: ${allowedTypes[fileType].join(", ")}`);
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      // Upload the file
      const response = await axios.post('/api/minio/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Get the URL for the uploaded file
      const urlResponse = await axios.get(`/api/minio/url?fileName=${encodeURIComponent(response.data.objectName)}`);
      
      // Call the callback with the file URL and name
      onUploadComplete(urlResponse.data.url, response.data.objectName);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
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
        disabled={uploading}
        variant={variant}
        size={size}
        className={className}
      >
        {uploading ? (
          <div className="flex items-center">
            <span className="animate-spin mr-2">⟳</span> Uploading...
          </div>
        ) : (
          <div className="flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            {getButtonText()}
          </div>
        )}
      </Button>
    </>
  );
};

export default SimpleUploader;
