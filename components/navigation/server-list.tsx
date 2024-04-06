"use client"
import { DB } from "@/lib/prisma";
import { ScrollArea } from "../ui/scroll-area";
import { useUserModel } from "@/hooks/main-store";
import { useEffect, useState } from "react";
// import { PrismaClient } from "@prisma/client";

export const ServerList = ({ userId }: { userId: string }) => {
  // const DB = new PrismaClient();
  const { data, setUserModel } = useUserModel();
  const [serverData , setServerData] = useState(null);

  if (data?.isVerified === false && typeof window !== "undefined") {
    const userData = JSON.parse(localStorage.getItem("userData") as string);
    
    setUserModel(userData);
  }

  if(!data) return null;

  const getServer = async() => {
    try {
      const server = await DB.user.findFirst({
        where : {
          id : "10713cc4-6bbd-4017-9cea-77dab2ba8ac9"
        }
      });

      

    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(() => {
    getServer();
  } , []);
    
  return <ScrollArea>

  </ScrollArea>;
};
