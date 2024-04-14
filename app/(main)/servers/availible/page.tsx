import { AvailibleServerCart } from "@/components/server/availible-server-cart";
import { DB } from "@/lib/prisma";
import { Server, User } from "@prisma/client";
import React from "react";

const AvailibleServer = async () => {
  const server: (Server & { users: any })[] = await DB.server.findMany({
    where: {},
    include: { users: { select: { email: true, userName: true } } },
  });
  //   console.log(server);

  return (
    <div className="w-full h-full">
      <AvailibleServerCart server={server} />
    </div>
  );
};

export default AvailibleServer;
