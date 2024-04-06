"use client";
import { useParams, useRouter } from "next/navigation";
import { CustomToltip } from "../custom-component/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
              <img
                src={server.imageUrl}
                className="h-8 w-8 rounded-md"
                alt="server"
              />
            }
            message={server.name}
          />
        </div>
      ))}
    </ScrollArea>
  );
};
