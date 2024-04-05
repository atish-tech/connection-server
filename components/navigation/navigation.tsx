import Image from "next/image"
import { Separator } from "../ui/separator"
import { ServerList } from "./server-list"
// import { DB } from "@/lib/prisma"

export const Navigation = async () => {
  
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

        {/* Server */}
        <ServerList />

    </div>
  )
}
