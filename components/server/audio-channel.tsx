"use client";

import { Channel, ChannelType, User } from "@prisma/client";
import { Mic } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

type UserData = Partial<User>
interface AudioChannelProps {
  channel: Channel[];
  user: UserData;
}

export const AudioChannel = ({ channel , user }: AudioChannelProps) => {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="py-2">
      {channel.map((channel : Channel) => (
        <div
        onClick={() =>
          router.push(
            `/servers/${channel.serverId}/call/?channel=${channel.id}&type=${channel.type}`
          )
        }
        key={channel.id}
        className={`flex items-center justify-start p-2 text-xl hover:bg-zinc-800 cursor-pointer gap-3
              ${channel.id === Number(params?.channelId) && "bg-zinc-800/80"}
              
              `}
      >
        <Mic className="h-4 w-4" />
        <p>{channel.name}</p>
      </div>
      ))}
    </div>
  );
};
