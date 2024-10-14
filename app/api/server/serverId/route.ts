import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { ChannelType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const serverId = searchParams.get("id");

  const token = req.cookies.get("token")?.value || "";

  if (!token)
    return NextResponse.json({ message: "Unauthorized", status: 401 });

  const email = await decodeToken(token);

  const user = await DB.user.findFirst({
    where: { email },
    select: { id: true, email: true, userName: true, isVerified: true },
  });

  if (!user) return NextResponse.json({ message: "Unauthorized", status: 401 });

  const server = await DB.server.findUnique({
    where: {
      id: serverId as string,
    },
    include: {
      channels: true,
    },
  });

  const member = await DB.member.findMany({
    where: {
      serverId: serverId as string,
    },
    include: {
      user: true,
    },
  });

  const textChannel =
    server?.channels.filter((f) => f.type === ChannelType.TEXT) || [];
  const audioChannel =
    server?.channels.filter((f) => f.type === ChannelType.VOICE) || [];
  const videoChannel =
    server?.channels.filter((f) => f.type === ChannelType.VIDEO) || [];

  const memberRole = await DB.member.findFirst({
    where: {
      userId: user.id,
      serverId: server?.id,
    },
  });

  return NextResponse.json({
    server,
    member,
    textChannel,
    audioChannel,
    videoChannel,
    memberRole,
    user,
    status: 200,
  });

  return NextResponse.json({ message: serverId, status: 200 });
}
