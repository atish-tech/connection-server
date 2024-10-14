"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { UploadImage } from "./upload-image";
import { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { DrawerAction, useDrawerAction } from "@/hooks/use-drawer-action";
import { MessageState, useMessageStore } from "@/hooks/use-message-store";
import { ChannelMessageType } from "@prisma/client";

export const SendMessageDrawer = () => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const { loading, sendMessage }: MessageState = useMessageStore();

  const { isOpen, onClose, type, data }: DrawerAction = useDrawerAction();

  const { data: serverData } = data ?? {};

  return (
    <Dialog
      open={isOpen && type === "sendImage"}
      onOpenChange={() => onClose()}
    >
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
          onClick={(
            e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
          ) => {
            if (!imageUrl) {
              toast.error("Please upload an image first.");
              return;
            }

            sendMessage({
              message: imageUrl,
              messageType: ChannelMessageType.IMAGE,
              setMessage: setImageUrl as Dispatch<SetStateAction<string>>,
              channelId: serverData?.channelId as number,
              serverId: serverData?.serverId as string,
              e,
            });

            onClose();
          }}
          className="bg-green-600 hover:bg-green-500"
        >
          {loading ? <Loader className="animate-spin" /> : "Send"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
