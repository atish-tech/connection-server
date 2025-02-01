"use client";

import { supabase } from "@/utils/supabase";
import { X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useProfileStore } from "@/hooks/use-profile";

interface UploadImageProps {
  setImageUrl: (url: string | undefined) => void;
  imageUrl: string | undefined;
}

export const UploadImage = ({ imageUrl, setImageUrl }: UploadImageProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const { profile } = useProfileStore();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  }

  async function handleUpload(): Promise<void> {
    try {
      if (!file) return;

      setUploading(true);

      const { data } = await supabase.storage
        .from("server-image")
        .upload(`${profile.email}/${file.name}`, file, { upsert: true });

      setImageUrl(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data?.fullPath}`
      );

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-1">
      {/* Uploaded image preview */}
      {imageUrl !== undefined && imageUrl !== null && (
        <div className="w-[100px] h-[100px] relative flex items-center justify-center rounded-full ">
          <button
            onClick={() => setImageUrl(undefined)}
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
        <div className="px-10 py-5 rounded-lg relative flex items-center justify-center gap-10 bg-gray-900 text-white">
          <div>
            <a className="hover:text-green-300" target="_blank" href={imageUrl}>PDF Url</a>
          </div>
          <button
            onClick={() => setImageUrl(undefined)}
            type="button"
            className="bg-red-400 hover:bg-red-600 text-white p-1 rounded-full "
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )} */}

      <Input className="w-fit" type="file" onChange={handleFileChange} />
      <p> {file && file.name} </p>
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  );
};
