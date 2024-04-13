"use client";

import { File, Loader, Send, SendHorizonal, Smile } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

interface SendMessageProps {
  channelId: number;
  serverId: string;
  socket: WebSocket | null;
}

export const SendMessage = ({ channelId, serverId , socket }: SendMessageProps) => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if(message == "")   return;
    try {

      // send message to socket server
      socket?.send(message)

      setLoading(true)
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
    } finally{
      setLoading(false)
    }
  };

  return (
    <div className="w-full mt-4 flex items-center bg-zinc-800 p-5 gap-3">
      <File />
      <Smile />
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
        <SendHorizonal onClick={sendMessage} className="cursor-pointer" />
      )}
    </div>
  );
};
