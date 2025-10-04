"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initializeMinio, listObjects, getPresignedUrl, deleteObject } from "@/utils/minio";
import axios from "axios";

interface FileObject {
  name: string;
  size: number;
  lastModified: string;
  url?: string;
}

export default function MinIOTest() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize MinIO and fetch files on component mount
    const init = async () => {
      try {
        // Initialize happens server-side, but we'll check if MinIO is accessible
        await fetchFiles();
        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize MinIO:", error);
        setUploadStatus("Failed to initialize MinIO connection");
      }
    };
    
    init();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Fetch the list of files from our API endpoint
      const response = await axios.get('/api/minio/list');
      setFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
      setUploadStatus("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadStatus(`Uploading ${file.name}...`);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post('/api/minio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadStatus(`Uploaded ${file.name} successfully!`);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus(`Failed to upload ${file.name}`);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      await axios.delete(`/api/minio/delete?fileName=${encodeURIComponent(fileName)}`);
      setUploadStatus(`Deleted ${fileName} successfully!`);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error deleting file:", error);
      setUploadStatus(`Failed to delete ${fileName}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">MinIO Test Page</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="max-w-md"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Choose File
          </Button>
        </div>
        {uploadStatus && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {uploadStatus}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stored Files</h2>
          <Button
            onClick={fetchFiles}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
        
        {files.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Size</th>
                  <th className="px-4 py-2 text-left">Last Modified</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.name} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 break-all">{file.name}</td>
                    <td className="px-4 py-2">{Math.round(file.size / 1024)} KB</td>
                    <td className="px-4 py-2">{new Date(file.lastModified).toLocaleString()}</td>
                    <td className="px-4 py-2 space-x-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            {loading ? "Loading files..." : "No files found. Upload one to get started."}
          </p>
        )}
      </div>
    </div>
  );
}
