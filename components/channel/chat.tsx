import { Loader, User } from "lucide-react";
import Image from "next/image";
import { ChatAction } from "./chat-action";
import { format } from "date-fns";
import { ChannelMessageType } from "@prisma/client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { editChat } from "@/serverAction/chat";
import { toast } from "sonner";
const DATE_FORMAT = "d MMM yyyy, HH:mm";

export function Chat({ chat }: { chat: any }) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>(chat.content);

  function setEditing() {
    setIsEditing(true);
  }

  return (
    <div
      key={chat.id}
      className="flex items-center h-full hover:bg-zinc-800 p-3 gap-3 w-full"
    >
      <User className="bg-transparent/20 p-1 rounded-full h-8 w-8 text-white" />

      <div>
        <p className="text-lg pb-2 text-zinc-300">
          @ {chat.members.user.userName}
        </p>

        {chat.type === ChannelMessageType.TEXT &&
          (isEditing ? (
            <div className="flex items-center justify-center gap-2 w-full">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent "
              />

              <Button
                onClick={async () => {
                  try {
                    setLoading(true);

                    await editChat(chat.id, content);

                    setIsEditing(false);

                    toast.success("Message edited successfully");
                  } catch (error) {
                    toast.error("Failed to edit message");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                size="sm"
                className="bg-green-900 hover:bg-green-800 flex items-center justify-center gap-1"
              >
                {loading && <Loader className="animate-spin w-4 h-4" />}
                Save
              </Button>

              <Button
                onClick={() => setIsEditing(false)}
                size="sm"
                className="bg-red-500 hover:bg-red-400"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <p className="text-xl">{chat.content} </p>
          ))}

        {chat.type === ChannelMessageType.IMAGE && (
          <div className="h-[150px] w-[150px] object-cover">
            <Image
              src={chat.content}
              alt="message"
              height={100}
              width={100}
              className="w-[150px] h-[150px] object-cover bg-transparent"
            />
          </div>
        )}

        {chat.type === ChannelMessageType.PDF && (
          <a
            className="text-sky-400 hover:text-sky-700"
            target="_blank"
            href={chat.content}
          >
            Pdf File Link
          </a>
        )}

        <p className="text-xs text-zinc-400 pt-1">
          {format(new Date(chat.createdAt), DATE_FORMAT)}{" "}
        </p>
      </div>

      <ChatAction chat={chat} setEditing={setEditing} />
    </div>
  );
}
