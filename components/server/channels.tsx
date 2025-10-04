"use client";

import { useSheetAction } from "@/hooks/sheet";
import { Channel, ChannelType, Member, MemberRole, User } from "@prisma/client";
import { Hash, Mic, Pencil, Trash, Video } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams, useRouter } from "next/navigation";
import { Delete } from "../channel/delete";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

const channelIconMap = {
  [ChannelType.TEXT]: <Hash className="h-4 w-4" />,
  [ChannelType.VOICE]: <Mic className="h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="h-4 w-4" />,
};

interface TextChannelProps {
  textChannel: Channel[];
  audioChannel: Channel[];
  videoChannel: Channel[];
  user: User;
  member: Member;
  serverId: string
}

export const Channels = ({
  textChannel,
  audioChannel,
  videoChannel,
  user,
  member,
  serverId
}: TextChannelProps) => {
  const router: AppRouterInstance = useRouter();

  const params: Params = useParams();

  const { onClose } = useSheetAction();

  return (
    <ScrollArea className="h-full w-full">
      {/* text */}
      <div className="py-2">
        {textChannel.map((channel: Channel) => (
          <div
            onClick={() => {
              router.push(
                `/servers/${channel.serverId}/${channel.id}/?channelName=${channel.name}`
              );
              onClose();
            }}
            key={channel.id}
            className={`group flex items-center justify-start p-2 text-xl hover:bg-zinc-800 cursor-pointer gap-3
             ${channel.id === Number(params?.channelId) && "bg-zinc-800/80"}
             `}
          >
            {channelIconMap[ChannelType.TEXT]}

            <p>{channel.name}</p>

            {channel.name !== "general" && member.role !== MemberRole.GUEST && (
              <div className="ml-auto flex items-center gap-x-2 mr-2">
                <Pencil className="w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition hidden group-hover:block" />

                <Delete channel={channel} user={user} member={member} serverId={serverId} />
              </div>
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-zinc-800 h-[2px]" />

      {/* audio */}
      <div className="py-2">
        {audioChannel.map((channel: Channel) => (
          <div
            onClick={() => {
              router.push(
                `/servers/${channel.serverId}/call/?channel=${channel.id}&type=${channel.type}`
              );
              onClose();
            }}
            key={channel.id}
            className={`group flex items-center justify-start p-2 text-xl hover:bg-zinc-800 cursor-pointer gap-3
              ${channel.id === Number(params?.channelId) && "bg-zinc-800/80"}
              
              `}
          >
            <Mic className="h-4 w-4" />

            <p>{channel.name}</p>

            {member.role !== MemberRole.GUEST && (
              <div className="ml-auto flex items-center gap-x-2 mr-2">
                <Pencil className="w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition hidden group-hover:block" />

                <Delete channel={channel} member={member} user={user} serverId={serverId} />
              </div>
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-zinc-800 h-[2px]" />

      {/* video */}
      <div className="py-2">
        {videoChannel.map((channel: Channel) => (
          <div
            onClick={() => {
              router.push(
                `/servers/${channel.serverId}/call/?channel=${channel.id}&type=${channel.type}`
              );

              onClose();
            }}
            key={channel.id}
            className={`group flex items-center justify-start p-2 text-xl hover:bg-zinc-800 cursor-pointer gap-3
              ${channel.id === Number(params?.channelId) && "bg-zinc-800/80"}
              
              `}
          >
            <Video className="h-4 w-4" />

            <p>{channel.name}</p>

            {member.role !== MemberRole.GUEST && (
              <div className="ml-auto flex items-center gap-x-2 mr-2">
                <Pencil className="w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition hidden group-hover:block" />

                <Delete channel={channel} member={member} user={user} serverId={serverId}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
