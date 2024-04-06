"use client";

import { UploadButton } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UploadImageProps {
  setImageUrl: (url: string | null) => void;
  imageUrl: string | null;
}

export function UploadImage({ setImageUrl, imageUrl }: UploadImageProps) {
  
  const [fileType, setFileType] = useState<string | null>("null");

  return (
    <main className="w-full flex items-center justify-center flex-col gap-3">
      {/* Uploaded image preview */}
      {fileType !== "pdf" && imageUrl !== null && (
        <div className="w-[100px] h-[100px] relative flex items-center justify-center rounded-full ">
          <button
            onClick={() => setImageUrl(null)}
            type="button"
            className="bg-red-400 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            className="object-cover w-full h-full rounded-full"
            src={imageUrl || undefined}
            alt="Uploaded Image"
          />
        </div>
      )}

      {/* Uploaded PDF preview */}
      {/* {fileType === "pdf" && (
        <div className="w-[100px] h-[100px] relative flex items-center justify-center rounded-full bg-white text-black">
          <button
                onClick={() => setImageUrl(null)}
                type="button"
                className="bg-red-400 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm">
                    <X className="h-4 w-4" />
                </button>
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-2xl">PDF</span>
            <span className="text-xs">Preview not available</span>
          </div>
        </div>
      )} */}

      {/* Upload image button */}
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          setImageUrl(res[0].url);
          setFileType(res[0].url?.split(".").pop() ?? null);
        }}
        onUploadError={(error: Error) => {
          toast(error.message);
        }}
      />
    </main>
  );
}
