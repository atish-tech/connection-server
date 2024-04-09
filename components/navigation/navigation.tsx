import Image from "next/image";
import { Separator } from "../ui/separator";
import { ServerList } from "./server-list";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { CustomToltip } from "../custom-component/tooltip";
import { CreateServer } from "./create-server";
import { UserHoverCart } from "./user-cart-hover";

export const Navigation = async () => {
  const token = cookies().get("token")?.value || " ";

  if (!token) return redirect("/login");

  const email = await decodeToken(token);

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
      <div className="">
        <Image
          src={"/logo.png"}
          className="w-[50px]"
          width={100}
          height={100}
          alt="image"
        />
      </div>

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
