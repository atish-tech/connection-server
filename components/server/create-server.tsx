"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogWrapper } from "@/components/ui/dialog-wrapper";
import { Loader } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import ImageUploader from "../file-upload/image-uploader";

const CreateServerSchema = z.object({
  imageUrl: z.string().min(10, { message: "Please provide an image" }),
  serverName: z.string().min(2, { message: "Please provide a server name" }),
});

export const CreateServer = () => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [serverName, setServerName] = useState<string | undefined>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router: AppRouterInstance = useRouter();

  const { isOpen, onClose, type } = useDrawerAction();

  const drawerOpen: boolean = isOpen && type === "createServer";

  async function createServer() {
    const validate = CreateServerSchema.safeParse({ imageUrl, serverName });
    if (!validate.success) return toast.error(validate.error.errors[0].message);

    try {
      setLoading(true);

      await axios.post("/api/server", {
        imageUrl,
        name: serverName,
      });

      toast.success("Server created successfully!");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong! Try Again.");
    } finally {
      setLoading(false);
      onClose();
    }
  }

  return (
    <DialogWrapper 
      open={drawerOpen} 
      onClose={onClose}
      className="bg-zinc-800 text-white border-none rounded-lg p-6 gap-6 max-w-md">
        {/* title */}
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold">
            Create Server
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-1.5">
            Create a new server by uploading an image and providing a name.
          </DialogDescription>
        </DialogHeader>

        {/* upload image */}
        <ImageUploader
          imageUrl={imageUrl}
          onImageChange={setImageUrl}
          title="Server Image"
          buttonText="Upload Server Image"
          maxSizeMB={2}
          recommendationText="Recommended: 512x512px"
        />

        {/* server name */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-zinc-300">Server Name</div>
          <Input
            className="text-zinc-200 text-base bg-zinc-700/50 border-zinc-700 focus-visible:ring-zinc-500"
            placeholder="Enter a server name"
            onChange={(e) => setServerName(e.target.value)}
          />
        </div>

        {/* Create Server */}
        <Button
          disabled={loading}
          onClick={createServer}
          className="bg-emerald-600 hover:bg-emerald-500 transition-colors mt-4 w-full"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Creating Server...</span>
            </div>
          ) : (
            "Create Server"
          )}
        </Button>
      </DialogWrapper>
  );
};
