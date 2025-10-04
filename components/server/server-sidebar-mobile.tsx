"use client";
import React from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import { SheetAction, useSheetAction } from "@/hooks/sheet";
import { ServerSideBar } from "../server/server-side-bar";

export const ServerSideBarMobile = () => {
  const { type, onClose, isOpen, data }: SheetAction = useSheetAction();

  return (
    <Sheet open={isOpen && type === "serverChannel"} onOpenChange={onClose}>
      <SheetContent side="left" className=" bg-zinc-900 text-zinc-200 w-[80vw]">
        <ServerSideBar serverId={data?.serverId as string} />
      </SheetContent>
    </Sheet>
  );
};
