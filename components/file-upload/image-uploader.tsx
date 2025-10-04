"use client";

import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import OptimizedUploader from "./optimized-uploader";
import { toast } from "sonner";

interface ImageUploaderProps {
  imageUrl?: string;
  onImageChange: (url: string | undefined) => void;
  className?: string;
  title?: string;
  maxSizeMB?: number;
  buttonText?: string;
  recommendationText?: string;
  imageClassName?: string;
  imageContainerClassName?: string;
  previewSize?: {
    width: string;
    height: string;
  };
}

const ImageUploader = ({
  imageUrl,
  onImageChange,
  className = "",
  title = "Image",
  maxSizeMB = 2,
  buttonText,
  recommendationText = "Recommended: 512x512px",
  imageClassName = "h-40 w-40 object-cover rounded-md",
  imageContainerClassName = "bg-zinc-900/50 rounded-lg p-6 flex flex-col items-center justify-center border border-zinc-700",
  previewSize,
}: ImageUploaderProps) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {title && <div className="text-sm font-medium text-zinc-300">{title}</div>}

      {!imageUrl ? (
        <div className="bg-zinc-900/50 rounded-lg p-8 flex flex-col items-center justify-center border border-dashed border-zinc-700">
          <div className="mb-4">
            <div className="h-14 w-14 rounded-full bg-zinc-700/50 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-zinc-400" />
            </div>
          </div>
          <OptimizedUploader
            fileType="image"
            onUploadComplete={(url) => {
              onImageChange(url);
              toast.success(`${title} uploaded successfully`);
            }}
            onUploadError={(error) => {
              toast.error(error);
            }}
            maxSizeMB={maxSizeMB}
            buttonText={buttonText || `Upload ${title}`}
            variant="secondary"
            className="w-full sm:w-auto flex items-center justify-center"
          />
          {recommendationText && (
            <p className="text-xs text-zinc-500 mt-2">
              {recommendationText} (Max {maxSizeMB}MB)
            </p>
          )}
        </div>
      ) : (
        <div className={imageContainerClassName}>
          <div className="relative mx-auto">
            <img
              src={imageUrl}
              alt={`${title} Preview`}
              className={imageClassName}
              style={previewSize ? { width: previewSize.width, height: previewSize.height } : {}}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
              onClick={() => onImageChange(undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
