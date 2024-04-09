"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { UploadImage } from "./upload-image";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { useRouter } from "next/navigation";

const CreateServerSchema = z.object({
  imageUrl: z.string().min(10, { message: "Please provide an image" }),
  serverName: z.string().min(2, { message: "Please provide a server name" }),
});

export const EditServer = () => {
  const { isOpen, onClose, type, data } = useDrawerAction();
  const [imageUrl, setImageUrl] = useState(data?.server?.imageUrl);
  const [serverName, setServerName] = useState(data?.server?.name);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const drawerOpen = isOpen && type === "editServer";

  const editServer = async () => {
    // Validate input
    const validate = CreateServerSchema.safeParse({ imageUrl, serverName });
    if (!validate.success) return toast.error(validate.error.errors[0].message);

    // Create server logic here
    try {
      setLoading(true);
      await axios.put(`/api/server/?serverId=${data?.server?.id}`, {
        imageUrl,
        name: serverName,
      });
      router.refresh();
      toast.success("Server Updated successfull")
    } catch (error) {
      console.log(error);
      toast.error("Somthing went wrong! Try Again.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={drawerOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-800 text-white border-none">
        {/* title */}
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new server by uploading an image and providing a name.
          </DialogDescription>
        </DialogHeader>

        {/* upload image */}
        <UploadImage setImageUrl={setImageUrl} imageUrl={imageUrl} />

        {/* server name */}
        <Input
          className="text-zinc-800 text-xl"
          placeholder="Server Name"
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
        />

        {/* Create Server */}
        <Button
          disabled={loading}
          onClick={editServer}
          className="bg-green-600 hover:bg-green-500"
        >
          {loading ? <Loader className="animate-spin" /> : "Create Server"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
