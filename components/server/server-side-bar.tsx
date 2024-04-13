import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { Channel, ChannelType, User } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { TextChannel } from "./text-channel";
import { AudioChannel } from "./audio-channel";
import { VideoChannel } from "./video-channel";
import { Separator } from "../ui/separator";

export const ServerSideBar = async ({ serverId }: { serverId: string }) => {
  const token = cookies().get("token")?.value || " ";

  if (!token) return redirect("/login");

  const email = await decodeToken(token);

  type UserData = Partial<User>
  const user: UserData | null = await DB.user.findFirst({
    where: { email },
    select: { id: true, email: true, userName: true, isVerified: true },
  });

  // Validate User
  if (!user) return redirect("/login");

  // get server resources
  const server = await DB.server.findUnique({
    where: {
      id: serverId,
    },

    include: {
      channels: true,
    },
  });

  const member = await DB.member.findMany({
    where: {
      serverId,
    },
    include: {
      user: true,
    },
  });

  const textChannel: Channel[] =
    server?.channels.filter((f) => f.type === ChannelType.TEXT) || [];

  const audioChannel: Channel[] = (server?.channels || []).filter(
    (f) => f.type === ChannelType.VOICE
  );
  const videoChannel = (server?.channels || []).filter(
    (f) => f.type === ChannelType.VIDEO
  );

  // console.log(audioChannel);

  return (
    <div className="h-full w-full">

      {/* Header */}
      <ServerHeader
        server={server}
        serverMember={member}
        serverId={serverId}
        inviteCode={server?.inviteCode}
        serverName={server?.name}
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
