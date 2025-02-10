import { ServerSideBar } from "@/components/server/server-side-bar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { User } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) {
  const token: string = cookies().get("token")?.value || " ";

  if (!token) return redirect("/login");

  const email = await decodeToken(token);

  const user: User | null = await DB.user.findFirst({ where: { email } });

  if (!user) return redirect("/login");

  return (
    <ResizablePanelGroup className="h-full" direction="horizontal">
      <ResizablePanel
        className="w-full h-full  bg-zinc-900/50"
        defaultSize={20}
      >
        <ServerSideBar serverId={params.serverId} currentUser={user}/>
      </ResizablePanel>

      <ResizableHandle
        className="border-zinc-700 bg-zinc-700  text-black"
        withHandle
      />

      <ResizablePanel className="h-full" defaultSize={80}>
        <div className="w-full bg-zinc-800/10 h-full">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
