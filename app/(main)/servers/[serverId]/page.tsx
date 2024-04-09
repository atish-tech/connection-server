import { DB } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ServerId = async ({ params }: { params: { serverId: string } }) => {
  const channel = await DB.channel.findFirst({
    where: {
      serverId: params.serverId,
    },
  });
  return redirect(`/servers/${params.serverId}/${channel?.id}/?channelName=${channel?.name}`);
};

export default ServerId;
