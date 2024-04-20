"use client";

import {
  File,
  FileBarChart,
  Folder,
  ImageIcon,
  Loader,
  Send,
  SendHorizonal,
  Smile,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useDrawerAction } from "@/hooks/use-drawer-action";

interface SendMessageProps {
  channelId: number;
  serverId: string;
  socket: WebSocket | null;
}

export const SendMessage = ({
  channelId,
  serverId,
  socket,
}: SendMessageProps) => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { onOpen } = useDrawerAction();

  // Send Message
  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (message == "") return;
    try {
      // send message to socket server
      socket?.send(message);

      setLoading(true);
      const data = {
        content: message,
        channelId,
        serverId,
      };
      await axios.post("/api/channel/message", data);
      setMessage("");
      // toast.success("Message send Success");
    } catch (error) {
      console.log(error);
      toast.error("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-4 flex items-center bg-zinc-800 p-5 gap-3">
      {/* Send image or file */}
      <Popover>
        <PopoverTrigger>
          <File />
        </PopoverTrigger>
        <PopoverContent
          className="bg-zinc-800 text-white border-none w-fit p-8"
          side="top"
        >
          <ImageIcon
            className="h-8 w-8 cursor-pointer m-5 hover:text-zinc-500"
            onClick={() => onOpen("sendMessage" , {data : {channelId , serverId}})}
          />
          <Folder
            className="h-8 w-8 cursor-pointer m-5 hover:text-zinc-500"
            onClick={() => onOpen("sendPdf" , {data : {channelId , serverId}})}
          />
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
      <form className="w-full" onSubmit={sendMessage}>
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
          onClick={sendMessage}
          className="cursor-pointer hover:text-zinc-400"
        />
      )}
    </div>
  );
};
