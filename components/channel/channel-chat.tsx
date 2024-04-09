"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ChannelMessage } from "@prisma/client";
import { MoreHorizontal, MoreVertical, User } from "lucide-react";

export const ChannelChat = ({ channelId }: { channelId: number }) => {
  const [data, setData] = useState([]);
  const getMessage = async () => {
    try {
      const response = await axios.post(
        `/api/channel/message/getMessage/?channelId=${channelId}`
      );
      setData(response.data);

      // console.log(data);
    } catch (error) {
      console.log(error);
      toast.error("Error on getting message.");
    }
  };
  useEffect(() => {
    getMessage();
  }, []);
  return (
    <div className="w-full h-full flex overflow-auto text-white">
      <div className="flex flex-col mt-auto gap-3 w-full px-5">
        {data.length > 0 &&
          data?.map((m: any) => (
            <div key={m.id} className="flex items-center gap-3 w-full">
              <User />
              <div>
                <p className="text-zinc-400">{m.members.user.userName} </p>
                <p>{m.content} </p>
              </div>
              <p>{m.createdAt} </p>

              <MoreVertical className="ml-auto" />
            </div>
          ))}
      </div>
    </div>
  );
};
