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

export async function editChat(id: string, message: string) {
  try {
    await DB.channelMessage.update({
      where: {
        id,
      },
      data: {
        content: message,
      },
    });
  } catch (error) {
    console.log(error);
  }
}
