"use client";
import { useParams, useRouter } from "next/navigation";
import { CustomToltip } from "../custom-component/tooltip";
import { ScrollArea } from "../ui/scroll-area";

export const ServerList = ({ server }: { server: any }) => {
  const navigate = useRouter();
  const params = useParams();

  return (
    <ScrollArea>
      {server.map((server: any) => (
        <div
          key={server.id}
          onClick={() => navigate.push(`/servers/${server.id}`)}
          className={`flex items-center gap-2 p-2 rounded-md mt-2 hover:bg-zinc-700 ${
            server.id === params?.serverId ? "bg-zinc-600" : ""
          }`}
        >
          <CustomToltip
            component={
              <div className="h-8 w-8 object-cover">
              <img
                src={server.imageUrl}
                className="h-8 w-8 rounded-md object-cover bg-transparent"
                alt="server"
              />
              </div>
            }
            message={server.name}
          />
        </div>
      ))}
    </ScrollArea>
  );
};
