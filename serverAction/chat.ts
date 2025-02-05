"use server";

import { DB } from "@/lib/prisma";
import { ChannelMessage } from "@prisma/client";

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

export async function editChat(
  id: string,
  message: string
): Promise<ChannelMessage | null> {
  try {
    const response: ChannelMessage = await DB.channelMessage.update({
      where: {
        id,
      },
      data: {
        content: message,
        isEdited: true,
      },
    });

    return response;
  } catch (error) {
    console.log(error);

    return null;
  }
}
