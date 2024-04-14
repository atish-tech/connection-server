"use client";
import { Server, User } from "@prisma/client";
import React from "react";
import { format } from "date-fns";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { User2 } from "lucide-react";
import { useRouter } from "next/navigation";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface AvailibleServerCartProps {
  server: (Server & { users: User })[];
}

export const AvailibleServerCart = ({ server }: AvailibleServerCartProps) => {
  
  const router = useRouter();

  return (
    <div className="w-full h-full md:p-5 p-1 flex justify-center  flex-wrap gap-2 overflow-auto">
      {server.map((server: any) => (
        <div
          className="max-w-[300px]  w-full rounded-xl h-fit p-3 flex flex-col gap-5 bg-zinc-800"
          key={server.id}
        >
          <div className="flex w-full items-center justify-around">
            <div className="h-[100px] w-[100px] object-cover">
              <img
                src={server.imageUrl}
                className="object-cover w-full h-full rounded-3xl "
              />
            </div>

            <Separator
              orientation="vertical"
              className="h-[100px] w-1 bg-zinc-900"
            />

            <div className="flex flex-col gap-4">
              <p>{server.name} </p>
              <p>{format(new Date(server.createdAt), DATE_FORMAT)}</p>
              <Button
                onClick={() => {
                  router.push(`/invite/${server.inviteCode}`);
                  router.refresh();
                }}
                className="bg-green-900"
              >
                Join
              </Button>
            </div>
          </div>

          <Separator className="bg-zinc-900" />

          <div>
            <p className="text-green-300">Admin</p>
            <div className="flex gap-3 items-center">
              <User2 />
              <div>
                <p className="text-zinc-400">{server?.users.email} </p>
                <p>{server?.users.userName} </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
