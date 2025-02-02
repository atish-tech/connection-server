"use server";

import { DB } from "@/lib/prisma";

export async function deleteChat(id: string) {
  try {
    await DB.channelMessage.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log(error);
  }
}
