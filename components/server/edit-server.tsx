"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import ImageUploader from "../file-upload/image-uploader";
import { Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const EditServerSchema = z.object({
  imageUrl: z.string().min(10, { message: "Please provide an image" }),
  serverName: z.string().min(2, { message: "Please provide a server name" }),
});

export const EditServer = () => {
  const { isOpen, onClose, type, data } = useDrawerAction();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [serverName, setServerName] = useState<string | undefined>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router: AppRouterInstance = useRouter();

  const drawerOpen: boolean = isOpen && type === "editServer";

  // Log for debugging
  useEffect(() => {
    if (type === "editServer") {
      console.log("EditServer drawer state:", { isOpen, type, server: data?.server });
    }
  }, [isOpen, type, data]);

  // Reset state when drawer opens or server data changes
  useEffect(() => {
    if (drawerOpen && data?.server) {
      setImageUrl(data.server.imageUrl);
      setServerName(data.server.name);
    }
  }, [drawerOpen, data?.server]);

  const handleEditServer = async () => {
    // Validate input
    const validate = EditServerSchema.safeParse({ imageUrl, serverName });
    if (!validate.success) return toast.error(validate.error.errors[0].message);

    if (!data?.server?.id) {
      toast.error("Server ID is missing");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/api/server/?serverId=${data.server.id}`, {
        imageUrl,
        name: serverName,
      });

      toast.success("Server updated successfully!");
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error("Failed to update server:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong! Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Since DialogWrapper isn't working properly for this component,
  // let's try using the regular Dialog directly
  return (
    <Dialog open={drawerOpen} onOpenChange={() => onClose()}>
      <DialogContent 
        className="bg-zinc-800 text-white border-none rounded-lg p-6 gap-6 max-w-md"
      >
        {/* title */}
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold">Edit Server</DialogTitle>
          <DialogDescription className="text-zinc-400 mt-1.5">
            Update your server details below.
          </DialogDescription>
        </DialogHeader>

        {/* upload image */}
        <ImageUploader
          imageUrl={imageUrl}
          onImageChange={setImageUrl}
          title="Server Image"
          buttonText="Change Server Image"
          maxSizeMB={2}
          recommendationText="Recommended: 512x512px"
        />

        {/* server name */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-zinc-300">Server Name</div>
          <Input
            className="text-zinc-200 text-base bg-zinc-700/50 border-zinc-700 focus-visible:ring-zinc-500"
            placeholder="Enter a server name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
          />
        </div>

        {/* Update Server button */}
        <Button
          disabled={loading}
          onClick={handleEditServer}
          className="bg-emerald-600 hover:bg-emerald-500 transition-colors mt-4 w-full"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Updating Server...</span>
            </div>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};