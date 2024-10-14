"use client";

import { useEffect, useState } from "react";
import { ServerHeader } from "./server-header";
import { TextChannel } from "./text-channel";
import { AudioChannel } from "./audio-channel";
import { VideoChannel } from "./video-channel";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChannelGroupSkelton } from "../skelton/ChannelGroupSkelton";

export const ServerSideBar = ({ serverId }: { serverId: string }) => {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/server/serverId/?id=${serverId}`);
      if (response.data.status === 401) {
        router.push("/login");
      } else {
        setData(response.data);
      }
    };

    fetchData();
  }, [serverId]);

  if (!data) {
    return <ChannelGroupSkelton />;
  }

  const {
    server,
    member,
    textChannel,
    audioChannel,
    videoChannel,
    memberRole,
    user,
  } = data;

  return (
    <div className="h-full w-full">
      {/* Header */}
      <ServerHeader
        server={server}
        serverMember={member}
        serverId={serverId}
        inviteCode={server?.inviteCode}
        serverName={server?.name}
        memberRole={memberRole?.role}
      />

      {/* Text Channel */}
      <TextChannel channel={textChannel} />

      <Separator className="bg-zinc-800 h-[2px]" />

      {/* Audio Channel */}
      <AudioChannel user={user} channel={audioChannel} />

      <Separator className="bg-zinc-800 h-[2px]" />

      {/* Video Channel */}
      <VideoChannel user={user} channel={videoChannel} />
    </div>
  );
};
