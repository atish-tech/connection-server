"use client";
import { ChannelChat } from "@/components/channel/channel-chat";
import { ChannelChatHeader } from "@/components/channel/cnannel-chat-header";
import { SendMessage } from "@/components/channel/send-message";
import { useMessageStore } from "@/hooks/use-message-store";
import { supabase } from "@/utils/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { MutableRefObject, useEffect, useRef } from "react";

const ChannelId = ({
  params,
}: {
  params: { channelId: string; serverId: string };
}) => {
  const { setChannel } = useMessageStore();

  const channelInstance: MutableRefObject<RealtimeChannel | null> =
    useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelInstance.current = supabase
      .channel(`channel:${params.channelId}`, {
        config: {
          broadcast: {
            self: true,
          },
        },
      })
      .subscribe();

    setChannel(channelInstance.current);
  }, [params.channelId]);

  return (
    <div className="w-full h-full flex flex-col">
      <ChannelChatHeader serverId={params.serverId} />

      <ChannelChat channelId={Number(params.channelId)} />

      <SendMessage
        channelId={Number(params.channelId)}
        serverId={params.serverId}
      />
    </div>
  );
};

export default ChannelId;
