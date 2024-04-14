"use client"
import { ChannelChat } from "@/components/channel/channel-chat";
import { ChannelChatHeader } from "@/components/channel/cnannel-chat-header";
import { SendMessage } from "@/components/channel/send-message";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ChannelId =  ({params} : {params : {channelId: string , serverId: string}}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [data, setData] = useState<{ content: any }[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    // const socket = new WebSocket("ws://www.web-socket-2762.onrender.com/");

    socket.onopen = () => {
      toast.success("Socket Connected");
      setSocket(socket);
    };

    socket.onmessage = (message) => {
      setData((m: { content: string }[]) => [...m, { content: message.data }]);
      // toast.success(message.data);
    };

    // Close connsecion
    return () => socket.close();
  }, []);

    return ( 
      <div className="w-full h-full flex flex-col">
        <ChannelChatHeader channelId={params.channelId} />
        <ChannelChat data={data} setData={setData} channelId={Number(params.channelId)} />
        <SendMessage socket={socket} channelId={Number(params.channelId)} serverId={params.serverId} />
      </div>
    )
  }
  
  export default ChannelId;
  