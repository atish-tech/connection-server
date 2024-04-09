"use client";

import { File, Send, SendHorizonal, Smile } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axios from "axios"

interface SendMessageProps {
    channelId : number;
    serverId: string
}

export const SendMessage = ({channelId , serverId } : SendMessageProps) => {
  const [message, setMessage] = useState<string>("");

    const sendMessage = async (e : any) => {
        e.preventDefault();
        try {
            const data = {
                content : message,channelId , serverId
            }
            await axios.post("/api/channel/message" , data)
            setMessage("");
            toast.success("Message send Success")
        } catch (error) {
            console.log(error);
            toast.error("Server Error")
        }
    }

  return (
    <div className="w-full flex items-center bg-zinc-800 p-5 gap-3">
      <File />
      <Smile />
<form className="w-full" onSubmit={sendMessage}>
<input value={message} onChange={(e) => setMessage(e.target.value)} className="bg-zinc-800 w-full border-none focus:outline-none focus:border-none" />

</form>
      <SendHorizonal />
    </div>
  );
};
