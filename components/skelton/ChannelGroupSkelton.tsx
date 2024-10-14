import React from "react";
import { Separator } from "../ui/separator";

export const ChannelGroupSkelton = () => {
  return (
    <div className="flex  flex-col h-full p-3 gap-3 w-full animate-pulse">
      <div className="w-full h-6 bg-gray-700 rounded sm:w-3/4 sm:h-4"></div>
      <div className="w-full h-6 bg-gray-700 rounded sm:w-3/4 sm:h-4"></div>
      <div className="w-full h-6 bg-gray-700 rounded sm:w-3/4 sm:h-4"></div>
      <Separator className="bg-zinc-700" />
      <div className="w-full h-6 bg-gray-700 rounded sm:w-3/4 sm:h-4"></div>
      <div className="w-full h-6 bg-gray-700 rounded sm:w-3/4 sm:h-4"></div>
      <Separator className="bg-zinc-700" />

      <div className="w-full h-6 bg-gray-700 rounded sm:w-3/4 sm:h-4"></div>
    </div>
  );
};
