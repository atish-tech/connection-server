"use client";
import {
  File,
  Folder,
  ImageIcon,
  Loader,
  SendHorizonal,
  Smile,
  Video,
} from "lucide-react";
import { useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { MessageState, useMessageStore } from "@/hooks/use-message-store";

interface SendMessageProps {
  channelId: number;
  serverId: string;
}

export const SendMessage = ({ channelId, serverId }: SendMessageProps) => {
  const [message, setMessage] = useState<string>("");

  const { loading, sendMessage }: MessageState = useMessageStore();

  const { onOpen } = useDrawerAction();

  return (
    <div className="w-full mt-4 flex items-center bg-zinc-800 p-5 gap-3">
      {/* Send image or file */}
      <Popover>
        <PopoverTrigger>
          <File />
        </PopoverTrigger>
        <PopoverContent
          className="bg-zinc-800 text-white border-none w-fit p-6 flex gap-5"
          side="top"
        >
          <div className="flex flex-col items-center">
            <ImageIcon
              className="h-8 w-8 cursor-pointer hover:text-zinc-500"
              onClick={() =>
                onOpen("sendImage", { data: { channelId, serverId } })
              }
            />
            <span className="text-xs mt-1">Image</span>
          </div>
          <div className="flex flex-col items-center">
            <Video
              className="h-8 w-8 cursor-pointer hover:text-zinc-500"
              onClick={() =>
                onOpen("sendVideo", { data: { channelId, serverId } })
              }
            />
            <span className="text-xs mt-1">Video</span>
          </div>
          <div className="flex flex-col items-center">
            <Folder
              className="h-8 w-8 cursor-pointer hover:text-zinc-500"
              onClick={() => onOpen("sendPdf", { data: { channelId, serverId } })}
            />
            <span className="text-xs mt-1">PDF</span>
          </div>
        </PopoverContent>
      </Popover>

      {/* <Emoji /> */}
      <Popover>
        <PopoverTrigger>
          <Smile className="text-zinc-100 dark:text-zinc-400 hover:text-zinc-400 dark:hover:text-zinc-300 transition" />
        </PopoverTrigger>
        <PopoverContent
          side="right"
          sideOffset={40}
          className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => setMessage(message + emoji.native)}
          />
        </PopoverContent>
      </Popover>

      {/* Input field */}
      <form
        className="w-full"
        onSubmit={(e) =>
          sendMessage({ message, setMessage, serverId, channelId, e })
        }
      >
        <input
          value={message}
          disabled={loading}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-zinc-800 w-full border-none focus:outline-none focus:border-none"
        />
      </form>

      {/* send message icon and indicater */}
      {loading ? (
        <Loader className="animate-spin" />
      ) : (
        <SendHorizonal
          onClick={(e: React.MouseEvent<SVGSVGElement>) =>
            sendMessage({ message, setMessage, serverId, channelId, e })
          }
          className="cursor-pointer hover:text-zinc-400"
        />
      )}
    </div>
  );
};
