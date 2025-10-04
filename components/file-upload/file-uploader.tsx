"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Upload, FileText, ImageIcon, Film } from "lucide-react";

interface FileUploaderProps {
  fileType: "image" | "video" | "pdf" | "any";
  onUploadSuccess?: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  buttonText?: string;
  className?: string;
}

const allowedTypes = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  pdf: ["application/pdf"],
  any: []
};

const FileUploader = ({
  fileType,
  onUploadSuccess,
  onUploadError,
  maxSizeMB = 10,
  buttonText,
  className = ""
}: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const getFileTypeIcon = () => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="w-4 h-4 mr-2" />;
      case "video":
        return <Film className="w-4 h-4 mr-2" />;
      case "pdf":
        return <FileText className="w-4 h-4 mr-2" />;
      default:
        return <Upload className="w-4 h-4 mr-2" />;
    }
  };

  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    switch (fileType) {
      case "image": return "Upload Image";
      case "video": return "Upload Video";
      case "pdf": return "Upload PDF";
      default: return "Upload File";
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeBytes) {
      setStatus(`File too large. Maximum size is ${maxSizeMB}MB.`);
      onUploadError?.(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    // Check file type if specific type is requested
    if (fileType !== "any" && !allowedTypes[fileType].includes(file.type)) {
      setStatus(`Invalid file type. Allowed types: ${allowedTypes[fileType].join(", ")}`);
      onUploadError?.(`Invalid file type. Allowed types: ${allowedTypes[fileType].join(", ")}`);
      return false;
    }

    return true;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!validateFile(file)) return;
    
    setUploading(true);
    setStatus(`Uploading ${file.name}...`);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post('/api/minio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setStatus(`Uploaded ${file.name} successfully!`);
      
      // Get the URL from the response and call the success callback
      if (onUploadSuccess && response.data.objectName) {
        // Fetch the URL for the uploaded file
        const urlResponse = await axios.get(`/api/minio/url?fileName=${encodeURIComponent(response.data.objectName)}`);
        onUploadSuccess(urlResponse.data.url, response.data.objectName);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = `Failed to upload ${file.name}`;
      setStatus(errorMessage);
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
    <div className={`flex flex-col gap-2 ${className}`}>
      <Input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={fileType !== "any" ? allowedTypes[fileType].join(",") : undefined}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        variant="outline"
        className="flex items-center"
      >
        {getFileTypeIcon()}
        {uploading ? "Uploading..." : getButtonText()}
      </Button>
      {status && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {status}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
