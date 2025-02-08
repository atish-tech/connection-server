"use client";
import { User } from "@prisma/client";
import { LogOut, Pen, Pencil, Sparkles, User2 } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { logout } from "@/serverAction/auth";

export const UserHoverCart = ({ user }: { user: User }) => {
  const { onOpen } = useDrawerAction();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="mt-auto">
        <User2 className="h-12 w-12 " />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-52 bg-zinc-800 text-white border-none"
        align="start"
      >
        <div className="py-1.5 px-2 w-full">
          <div className="font-medium">{user.userName}</div>
          <div className="text-sm w-full overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
            {user.email}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-zinc-700" />

        <DropdownMenuItem
          onClick={() => onOpen("editProfile", user)}
          className="cursor-pointer hover:bg-red-700"
        >
          <Pencil className="mr-2 h-4 w-4" />

          <span>Edit Profile</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-700" />

        <DropdownMenuItem
          onClick={() => {
            logout();
          }}
          className="!text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />

          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
