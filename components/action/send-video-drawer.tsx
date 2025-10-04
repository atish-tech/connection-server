"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { DrawerAction, useDrawerAction } from "@/hooks/use-drawer-action";
import { MessageState, useMessageStore } from "@/hooks/use-message-store";
import { ChannelMessageType } from "@prisma/client";

export const SendVideoDrawer = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);

  const { loading, sendMessage }: MessageState = useMessageStore();

  const { isOpen, onClose, type, data }: DrawerAction = useDrawerAction();

  const { data: serverData } = data ?? {};

  return (
    <Dialog
      open={isOpen && type === "sendVideo"}
      onOpenChange={onClose}
    >
      <DialogContent className="bg-zinc-800 text-white border-none">
        <DialogHeader>
          <DialogTitle>Send Video</DialogTitle>
        </DialogHeader>

        {/* upload video */}

        {/* Send video to the channel */}
        <Button
          disabled={loading}
          onClick={(
            e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
          ) => {
            if (!videoUrl) {
              toast.error("Please upload a video first.");
              return;
            }

            sendMessage({
              message: videoUrl,
              messageType: ChannelMessageType.VIDEO,
              setMessage: setVideoUrl as Dispatch<SetStateAction<string>>,
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
