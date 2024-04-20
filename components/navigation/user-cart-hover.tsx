"use client"
import { User } from "@prisma/client";
import { User2 } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useDrawerAction } from "@/hooks/use-drawer-action";

export const UserHoverCart = ({user} : {user : User}) => {
  const {onOpen} = useDrawerAction()
  return (
   <div className="mt-auto cursor-pointer" >
     <Popover>
      <PopoverTrigger><User2 className="h-12 w-12" /> </PopoverTrigger>
      <PopoverContent side="right" className="bg-zinc-800 text-white border-none">
       <p>{user.userName} </p> 
       <p>{user.email}</p>
        <div className="flex items-center justify-between mt-5">
        <Button onClick={() => onOpen("editProfile" , user)} className="" variant={"secondary"}>Edit</Button>
        <Button variant={"destructive"}>Logout</Button>
        </div>
      </PopoverContent>
    </Popover>
   </div>
  );
};
