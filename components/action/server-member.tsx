"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { useState } from "react";
import { Check, Copy, Dot, DotIcon, MoreVertical, User } from "lucide-react";
import { Member, MemberRole } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const ServerMembers = () => {
  const { isOpen, onClose, type, data , onOpen } = useDrawerAction();
  const drawerOpen = isOpen && type === "serverMembers";
  const router = useRouter();

  // Update member role
  const updateMember = async (serverId: string , memberId: number , role : MemberRole) => {
    try {
      
      const member = await axios.put(`/api/member`, {serverId , memberId , role});
      toast.success("User Updated");
      router.refresh();    
      onOpen("serverMembers", {member : member.data})
    } catch (error) {
      console.log(error);
      toast.error("Server Error")
    }
  }
  // Remove member from server
  const removeMember = async (serverId: string , memberId: number , role : MemberRole) => {
    try {
      
      const member = await axios.delete(`/api/member`,{data: {serverId , memberId , role}});
      toast.success("Member Removed");
      router.refresh();    
      onOpen("serverMembers", {member : member.data})
    } catch (error) {
      console.log(error);
      toast.error("Server Error")
    }
  }

  return (
    <Dialog open={drawerOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-800 text-white border-none">
        {/* title */}
        <DialogHeader>
          <DialogTitle>Server Members</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Menage your all members
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-auto flex flex-col items-center w-full gap-3">
          {data?.member?.map((member: any, index) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-5 w-full p-3 rounded-xl bg-zinc-700"
            >
              <div className="flex items-center gap-5">
                <User className="w-10 h-10" />
                <div>
                  <p>{member.user.email} </p>
                  <p>{member.user.userName} </p>
                  {/* change role */}
                  <p>{member.role}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical className="cursor-pointer hover:bg-zinc-800 rounded-full" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-800 text-white border-none" side="left">
                  <DropdownMenuItem onClick={() => updateMember(member.serverId , member.id , MemberRole.GUEST)} className="cursor-pointer hover:bg-zinc-700">{MemberRole.GUEST} {MemberRole.GUEST === member.role && <Check className="ml-3" />} </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateMember(member.serverId , member.id , MemberRole.MODERATOR)} className="cursor-pointer hover:bg-zinc-700">{MemberRole.MODERATOR} {MemberRole.MODERATOR === member.role && <Check className="ml-3" />} </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => removeMember(member.serverId , member.id , MemberRole.MODERATOR)} className="cursor-pointer hover:bg-zinc-700">Remove </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
