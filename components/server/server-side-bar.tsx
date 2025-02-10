"use client";

import { useEffect, useState } from "react";
import { ServerHeader } from "./server-header";
import { Channels } from "./channels"; 
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChannelGroupSkelton } from "../skelton/ChannelGroupSkelton";
import { useProfileStore, UseProfileType } from "@/hooks/use-profile";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ScrollArea } from "../ui/scroll-area";
import { Member, User } from "@prisma/client";

export const ServerSideBar = ({
  serverId,
  
}: {
  serverId: string;
 
}) => {
  const [data, setData] = useState<any>(null);

  const router: AppRouterInstance = useRouter();

  const { setProfile }: UseProfileType = useProfileStore();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/server/serverId/?id=${serverId}`);

      if (response.data.status === 401) {
        router.push("/login");
      } else {
        setProfile(response.data.user);

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
      <ServerHeader
        server={server}
        serverMember={member}
        serverId={serverId}
        inviteCode={server?.inviteCode}
        serverName={server?.name}
        memberRole={memberRole?.role}
      />

      <Channels
        textChannel={textChannel}
        audioChannel={audioChannel}
        videoChannel={videoChannel}
        user={user}
        member={memberRole as Member}
        serverId={server.id}
      />
    </div>
  );
};
