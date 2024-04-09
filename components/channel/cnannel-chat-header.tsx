"use client"

import { Hash } from "lucide-react";
import { useSearchParams } from "next/navigation"

export const ChannelChatHeader = ({channelId} :{channelId : string}) => {
    const params = useSearchParams();
    const channelName = params.get("channelName")
    return(
        <div className="flex items-center gap-4 bg-zinc-600/45 h-14 pl-3">
            <Hash className="w-8 h-8" />
            <p className="text-xl">{channelName}</p>
        </div>
    )
}