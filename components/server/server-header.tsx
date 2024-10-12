"use client";

import { useDrawerAction } from "@/hooks/use-drawer-action";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Edit,
  PlusCircle,
  Trash,
  UserPlus2,
  UsersRound,
} from "lucide-react";
import { Member, MemberRole, Server } from "@prisma/client";

interface ServerHeaderProps {
  serverId: string;
  serverName: string | undefined;
  inviteCode: string | undefined;
  serverMember?: Member[];
  server?: Server | null;
  memberRole?: MemberRole;
}

export const ServerHeader = ({
  serverId,
  serverName,
  inviteCode,
  serverMember,
  server,
  memberRole,
}: ServerHeaderProps) => {
  const { onOpen } = useDrawerAction();

  return (
    <div className="w-full">
      <DropdownMenu>
        {/* server name with drop down indicater */}
        <DropdownMenuTrigger className="w-full flex items-center justify-between px-5 h-10 focus:outline-none bg-zinc-700/10 hover:bg-zinc-700/55">
          {serverName} <ChevronDown />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[100%] border-none bg-zinc-800">
          {/* Create Channel */}
          {memberRole === MemberRole.ADMIN && (
            <DropdownMenuItem
              className="bg-zinc-800/60 cursor-pointer text-green-600 min-w-[250px] hover:bg-zinc-700"
              onClick={() => {
                onOpen("createChannel", { id: serverId });
              }}
            >
              Create Channel
              <PlusCircle className="ml-auto h-4 w-4" />
            </DropdownMenuItem>
          )}

          {/* Invite people */}
          <DropdownMenuItem
            className="bg-zinc-800/60 cursor-pointer text-white min-w-[250px] hover:bg-zinc-700"
            onClick={() => {
              onOpen("invitePeople", { id: inviteCode });
            }}
          >
            Invite People
            <UserPlus2 className="ml-auto h-4 w-4" />
          </DropdownMenuItem>

          {/* Members */}
          <DropdownMenuItem
            className="bg-zinc-800/60 cursor-pointer text-white min-w-[250px] hover:bg-zinc-700"
            onClick={() => {
              onOpen("serverMembers", { member: serverMember });
            }}
          >
            Members
            <UsersRound className="ml-auto h-4 w-4" />
          </DropdownMenuItem>

          {/* Edit server */}
          {memberRole === MemberRole.ADMIN && (
            <DropdownMenuItem
              className="bg-zinc-800/60 cursor-pointer text-white min-w-[250px] hover:bg-zinc-700"
              onClick={() => {
                onOpen("editServer", { server });
              }}
            >
              Edit Server
              <Edit className="ml-auto h-4 w-4" />
            </DropdownMenuItem>
          )}

          {/* delete server */}
          {memberRole === MemberRole.ADMIN && (
            <DropdownMenuItem
              className="bg-zinc-800/60 cursor-pointer text-red-600 min-w-[250px] hover:bg-zinc-700"
              onClick={() => {
                onOpen("deleteServer", { server });
              }}
            >
              Delete Server
              <Trash className="ml-auto h-4 w-4" />
            </DropdownMenuItem>
          )}

          {/* Leave server */}
          {memberRole !== MemberRole.ADMIN && (
            <DropdownMenuItem
              className="bg-zinc-800/60 cursor-pointer text-red-600 min-w-[250px] hover:bg-zinc-700"
              onClick={() => {
                onOpen("leaveServer", { data: { serverId, memberRole } });
              }}
            >
              Leave Server
              <Trash className="ml-auto h-4 w-4" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
