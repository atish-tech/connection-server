"use client";

import { useSheetAction } from "@/hooks/sheet";
import { Hash, Server } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const ChannelChatHeader = ({ serverId }: { serverId: string }) => {
  const params = useSearchParams();

  const channelName = params.get("channelName");

  const { onOpen } = useSheetAction();

  return (
    <div className="flex items-center gap-4 bg-zinc-600/45 h-14 px-5">
      <div className="mr-auto xs:flex md:hidden">
        <Server
          onClick={() => onOpen("serverChannel", { serverId })}
          className="w-8 h-8  "
        />
      </div>

      <Hash className="w-8 h-8" />
      <p className="text-xl">{channelName}</p>
    </div>
  );
};
