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
import axios from "axios";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { useRouter } from "next/navigation";
import { ChannelMessageType } from "@prisma/client";

export const SendPdfDrawer = () => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { isOpen, onClose, type, data } = useDrawerAction();
  const drawerOpen = isOpen && type === "sendPdf";

  // const { channelId, serverId } = data?.data as {
  //   channelId?: number | null | undefined;
  //   serverId?: string | null | undefined;
  // };

  const sendMessage = async () => {
    try {
      setLoading(true);

      const messageData = {
        content: imageUrl,
        type: ChannelMessageType.PDF,
        channelId: data?.data?.channelId,
        serverId: data?.data?.serverId,
      };

      await axios.post("/api/channel/message", messageData);

      router.refresh();
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
          <DialogTitle>Send File</DialogTitle>
        </DialogHeader>

        {/* upload image */}
        <UploadImage setImageUrl={setImageUrl} imageUrl={imageUrl} />

        {/* Send image to the channel */}
        <Button
          disabled={loading}
          onClick={sendMessage}
          className="bg-green-600 hover:bg-green-500"
        >
          {loading ? <Loader className="animate-spin" /> : "Send"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
