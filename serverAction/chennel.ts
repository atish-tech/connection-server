"use server";

import { DB } from "@/lib/prisma";
import { Channel, Member, MemberRole, User } from "@prisma/client";
import { Router } from "next/router";

export async function deleteChannel(
  channel: Channel,
  user: User,
  member: Member,
  serverId: string
) {
  try {
    const dbMember = await DB.member.findFirst({
      where: {
        userId: user.id,
        serverId,
      },
    });

    if (dbMember?.role === MemberRole.ADMIN) {
      await DB.channel.delete({
        where: {
          id: channel.id,
        },
      });
    } else {
      throw new Error("You don't have an access to delete Channel");
    }
  } catch (error) {
    console.log(error);
  }
}
