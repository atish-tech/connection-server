"use client";

import { useState } from "react";
import FileUploader from "./file-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UploadedFile {
  url: string;
  fileName: string;
  type: "image" | "video" | "pdf" | "any";
}

const FileUploadDemo: () => JSX.Element = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleUploadSuccess = (
    fileUrl: string,
    fileName: string,
    type: "image" | "video" | "pdf" | "any"
  ) => {
    setUploadedFiles((prev) => [...prev, { url: fileUrl, fileName, type }]);
  };

  const renderFilePreview = (file: UploadedFile) => {
    switch (file.type) {
      case "image":
        return (
          <div className="my-2">
            <img
              src={file.url}
              alt={file.fileName}
              className="max-w-full h-auto max-h-48 rounded"
            />
            <p className="text-sm text-gray-500 mt-1">{file.fileName}</p>
          </div>
        );
      case "video":
        return (
          <div className="my-2">
            <video controls className="max-w-full h-auto max-h-48 rounded">
              <source src={file.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="text-sm text-gray-500 mt-1">{file.fileName}</p>
          </div>
        );
      case "pdf":
        return (
          <div className="my-2">
            <iframe src={file.url} className="w-full h-48 rounded" />
            <p className="text-sm text-gray-500 mt-1">{file.fileName}</p>
          </div>
        );
      default:
        return (
          <div className="my-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {file.fileName}
            </a>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">File Upload Components</h1>

      <Tabs defaultValue="image">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
          <TabsTrigger value="any">Any File</TabsTrigger>
        </TabsList>

        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Image Uploader</CardTitle>
              <CardDescription>
                Upload image files (JPEG, PNG, GIF, WebP)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                fileType="image"
                onUploadSuccess={(url, fileName) =>
                  handleUploadSuccess(url, fileName, "image")
                }
                onUploadError={(error) => console.error(error)}
                maxSizeMB={5}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video Uploader</CardTitle>
              <CardDescription>
                Upload video files (MP4, WebM, OGG)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                fileType="video"
                onUploadSuccess={(url, fileName) =>
                  handleUploadSuccess(url, fileName, "video")
                }
                maxSizeMB={50}
                buttonText="Upload Video File"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf">
          <Card>
            <CardHeader>
              <CardTitle>PDF Uploader</CardTitle>
              <CardDescription>Upload PDF documents</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                fileType="pdf"
                onUploadSuccess={(url, fileName) =>
                  handleUploadSuccess(url, fileName, "pdf")
                }
                maxSizeMB={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="any">
          <Card>
            <CardHeader>
              <CardTitle>Any File Uploader</CardTitle>
              <CardDescription>Upload any type of file</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                fileType="any"
                onUploadSuccess={(url, fileName) =>
                  handleUploadSuccess(url, fileName, "any")
                }
                maxSizeMB={20}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border rounded p-3">
                {renderFilePreview(file)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadDemo;
