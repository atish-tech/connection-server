import { ChannelChat } from "@/components/channel/channel-chat";
import { ChannelChatHeader } from "@/components/channel/cnannel-chat-header";
import { SendMessage } from "@/components/channel/send-message";

const ChannelId =  ({params} : {params : {channelId: string , serverId: string}}) => {
  
    return ( 
      <div className="w-full h-full flex flex-col">
        <ChannelChatHeader channelId={params.channelId} />
        <ChannelChat channelId={Number(params.channelId)} />
        <SendMessage channelId={Number(params.channelId)} serverId={params.serverId} />
      </div>
    )
  }
  
  export default ChannelId;
  