import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { User } from "@prisma/client";
import { User2 } from "lucide-react";
import { Button } from "../ui/button";

export const UserHoverCart = ({user} : {user : User}) => {
  return (
   <div className="mt-auto cursor-pointer" >
     <HoverCard>
      <HoverCardTrigger><User2 className="h-12 w-12" /> </HoverCardTrigger>
      <HoverCardContent side="right" className="bg-zinc-800 text-white border-none">
       <p>{user.userName} </p> 
       <p>{user.email}</p>
        <div className="flex items-center justify-between mt-5">
        <Button className="" variant={"secondary"}>Edit</Button>
        <Button variant={"destructive"}>Logout</Button>
        </div>
      </HoverCardContent>
    </HoverCard>
   </div>
  );
};
