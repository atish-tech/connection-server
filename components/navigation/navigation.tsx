import { Separator } from "../ui/separator";
import { ServerList } from "./server-list";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeTokenServer } from "@/lib/jwt-server";
import { DB } from "@/lib/prisma";
import { CreateServer } from "./create-server";
import { UserHoverCart } from "./user-cart-hover";
import { LogoAvalibleServer } from "./logo";

export const Navigation = async () => {
  const token = cookies().get("token")?.value || " ";

  if (!token || token.trim() === '') return redirect("/login");

  const email = await decodeTokenServer(token);

  if (!email) return redirect("/login");

  // find user
  const user = await DB.user.findFirst({ where: { email } });

  if (!user) return redirect("/login");

  // find server
  const server = await DB.server.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    select: { id: true, name: true, imageUrl: true },
  });

  return (
    <div className="h-full bg-zinc-800/20 p-3 flex flex-col gap-3">
      {/* logo */}
      <LogoAvalibleServer />

      <Separator className="bg-zinc-600 " />

      {/* Create Server */}
      <CreateServer />

      <Separator className="bg-zinc-600 " />

      {/* Server */}
      <ServerList server={server} />

      {/* User Profile */}
      <UserHoverCart user={user} />
    </div>
  );
};
