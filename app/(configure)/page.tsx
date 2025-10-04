// import { InitilizedServer } from "@/components/initilized/initilized-server";
import { InitilizedUser } from "@/components/initilized/initilized-user";
import { decodeTokenServer } from "@/lib/jwt-server";
import { DB } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = cookies().get("token")?.value || " ";

  if (!token || token.trim() === '') return redirect("/login");

  const email = await decodeTokenServer(token);

  if (!email) return redirect("/login");

  const user = await DB.user.findFirst({
    where: { email },
    select: { id: true, email: true, userName: true, isVerified: true },
  });

  // Validate User
  if (!user) return redirect("/login");

  // find first server
  const server = await DB.server.findFirst({
    where: {
      members: {
        some: {
          userId: user?.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      adminId: true,
      members: true,
      channels: true
    },
  });

  // find first server and redirect to first server
  // &
  // set user data into localstorage
  if (server) return <InitilizedUser channelName={server.channels[0].name} user={user} channelId={server.channels[0].id} serverId={server.id}  />;
  
  // if user is not a member of any server
  else return redirect("/servers/availible");
}
