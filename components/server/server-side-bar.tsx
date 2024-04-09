import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { ChannelType } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { TextChannel } from "./text-channel";



export const ServerSideBar = async ({ serverId }: { serverId: string }) => {
  const token = cookies().get("token")?.value || " ";

  if (!token) return redirect("/login");

  const email = await decodeToken(token);

  const user = await DB.user.findFirst({
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
      serverId
    },
    include: {
      user: true
    }
  });

  

  const textChannel = server?.channels.filter(
    (f) => f.type === ChannelType.TEXT
  );
  const audioChannel = server?.channels.filter(
    (f) => f.type === ChannelType.VOICE
  );
  const videoChannel = server?.channels.filter(
    (f) => f.type === ChannelType.VIDEO
  );

  return (
    <div className="h-full w-full">
      {/* Header */}
      <ServerHeader server={server} serverMember={member} serverId={serverId} inviteCode={server?.inviteCode} serverName={server?.name} />

      {/* Text Channel */}
      {textChannel?.map((channel) => (
       <div className="w-full h-full " key={channel.id}>
         <TextChannel channel={channel} />
        </div>
      ))}
    </div>
  );
};
