// import { InitilizedServer } from "@/components/initilized/initilized-server";
import { InitilizedUser } from "@/components/initilized/initilized-user";
import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = cookies().get("token")?.value || " ";

  if (!token) return redirect("/login");

  const email = await decodeToken(token);

  const user = await DB.user.findFirst({
    where: { email },
    select: { id: true, email: true, userName: true, isVerified: true },
  });

  // Validate User
  if (!user) return redirect("/login");

  // find first server
  const server: any = await DB.server.findFirst({
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
    },
  });

  // find first server and redirect to first server
  // &
  // set user data into localstorage
  if (server) return <InitilizedUser user={user} serverId={server.id} />;
  
  // if user is not a member of any server
  else return redirect("/servers/availible");
}
