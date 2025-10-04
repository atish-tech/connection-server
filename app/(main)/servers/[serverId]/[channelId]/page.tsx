"use client";
import { ChannelChat } from "@/components/channel/chats";
import { ChannelChatHeader } from "@/components/channel/cnannel-chat-header";
import { MessageInputWithUpload } from "@/components/channel/message-input-with-upload";

function ChannelId({
  params,
}: {
  params: { channelId: string; serverId: string };
}) {



  return (
    <div className="w-full h-full flex flex-col">
      <ChannelChatHeader serverId={params.serverId} />

      <ChannelChat 
        channelId={Number(params.channelId)} 
        serverId={params.serverId}
      />

      <MessageInputWithUpload
        channelId={Number(params.channelId)}
        serverId={params.serverId}
      />
    </div>
  );
}

export default ChannelId;
