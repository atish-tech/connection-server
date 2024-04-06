import Image from "next/image"
import { Separator } from "../ui/separator"
import { ServerList } from "./server-list"
import { CreateServer } from "../action/create-server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { decodeToken } from "@/config/decodeToken"
import { DB } from "@/lib/prisma"
// import { DB } from "@/lib/prisma"

export const Navigation = async () => {

  const token = cookies().get("token")?.value || " ";
  if(!token) return redirect("/login");

  const email = await decodeToken(token);

  const user = await DB.user.findFirst({where:{email}});
  if(!user) return redirect("/login");

  
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

        {/* Server */}
        <ServerList userId={user.id} />

    </div>
  )
}
