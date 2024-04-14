"use client";

import { useUserModel } from "@/hooks/main-store";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export const InitilizedUser = ({ user, serverId , channelId , channelName}: any) => {
  const { setUserModel } = useUserModel();
  setUserModel(user);

  useEffect(() => {
    // localStorage.setItem("userData", JSON.stringify(user));
    redirect(`/servers/${serverId}/${channelId}/?channelName=${channelName}`);

  }, []);
  return <></>;
};
