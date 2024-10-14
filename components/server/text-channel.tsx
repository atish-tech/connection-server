"use client";

import { useSheetAction } from "@/hooks/sheet";
import { Channel, ChannelType } from "@prisma/client";
import { Hash, Mic, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const channelIconMap = {
  [ChannelType.TEXT]: <Hash className="h-4 w-4" />,
  [ChannelType.VOICE]: <Mic className="h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="h-4 w-4" />,
};

interface TextChannelProps {
  channel: Channel[];
}

export const TextChannel = ({ channel }: TextChannelProps) => {
  const router = useRouter();
  const params = useParams();

  const { onClose } = useSheetAction();

  return (
    <div className="py-2">
      {channel.map((channel: Channel) => (
        <div
          onClick={() => {
            router.push(
              `/servers/${channel.serverId}/${channel.id}/?channelName=${channel.name}`
            );

            onClose();
          }}
          key={channel.id}
          className={`flex items-center justify-start p-2 text-xl hover:bg-zinc-800 cursor-pointer gap-3
              ${channel.id === Number(params?.channelId) && "bg-zinc-800/80"}
              
              `}
        >
          {channelIconMap[ChannelType.TEXT]}
          <p>{channel.name}</p>
        </div>
      ))}
    </div>
  );
};
