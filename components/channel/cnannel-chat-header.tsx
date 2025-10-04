"use client";

import { useSheetAction } from "@/hooks/sheet";
import { Hash, Server, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { OnlineStatusIndicator } from "../server/online-status-indicator";
import { Separator } from "@/components/ui/separator";

export const ChannelChatHeader = ({ serverId }: { serverId: string }) => {
  const params = useSearchParams();

  const channelName = params?.get("channelName");
  const channelId = params?.get("channelId") ? parseInt(params?.get("channelId")!, 10) : undefined;

  const { onOpen } = useSheetAction();

  return (
    <div className="flex items-center gap-4 bg-zinc-600/45 h-14 px-5">
      <div className="mr-auto xs:flex md:hidden">
        <Server
          onClick={() => onOpen("serverChannel", { serverId })}
          className="w-8 h-8"
        />
      </div>

      <Hash className="w-8 h-8" />
      <p className="text-xl">{channelName}</p>

      <div className="ml-auto px-3 py-2">
        <OnlineStatusIndicator serverId={serverId} />
      </div>
      
      <Separator orientation="vertical" className="h-8 bg-zinc-500 mx-2" />
      
      {channelId && (
        <OnlineStatusIndicator 
          serverId={serverId} 
          channelId={channelId}
        />
      )}
    </div>
  );
}; 








