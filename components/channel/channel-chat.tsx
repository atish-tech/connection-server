"use client";

import { RefObject, useEffect, useRef } from "react";
import { ChannelMessageType } from "@prisma/client";
import { MoreVertical, User } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { MessageState, useMessageStore } from "@/hooks/use-message-store";
import { MessageSkeletonGroup } from "../skelton/MessageSkelton";
import { Button } from "../ui/button";
const DATE_FORMAT = "d MMM yyyy, HH:mm";

export const ChannelChat = ({ channelId }: { channelId: number }) => {
  const {
    messages,
    getMessages,
    channel,
    addMessage,
    messageLoading,
    page,
    incrementPage,
  }: MessageState = useMessageStore();

  const chatContainerRef: RefObject<HTMLDivElement> =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages({ channelId });
  }, [channelId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (channel.current) {
      channel.current.on("broadcast", { event: "message" }, (payload) => {
        if (
          payload.payload.message &&
          payload.payload.message.channelId === channelId
        ) {
          addMessage(payload.payload.message);
        }
      });
    }

    return () => {
      channel.current?.unsubscribe();
      channel.current = null;
    };
  }, [channel.current]);

  return (
    <div
      className="w-full h-full flex overflow-auto text-white"
      ref={chatContainerRef}
    >
      <div className="flex flex-col mt-auto gap-4 w-full ">
        {messageLoading && <MessageSkeletonGroup />}

        {messages.length >= 10 && !messageLoading && (
          <Button
            size="sm"
            onClick={() => {
              incrementPage();
              getMessages({ channelId, page: page + 1 });
            }}
            className="mx-auto text-xs hover:bg-zinc-800  mt-2 bg-transparent border border-zinc-700"
          >
            Load More
          </Button>
        )}

        {messages.length > 0 &&
          messages?.map((m: any) => (
            <div
              key={m.id}
              className="flex items-center h-full hover:bg-zinc-800 p-3 gap-3 w-full"
            >
              <User className="bg-transparent/20 p-1 rounded-full h-8 w-8 text-white" />
              <div>
                <p className="text-lg pb-2 text-zinc-300">
                  @ {m.members.user.userName}
                </p>

                {m.type === ChannelMessageType.TEXT && (
                  <p className="text-xl">{m.content} </p>
                )}

                {m.type === ChannelMessageType.IMAGE && (
                  <div className="h-[150px] w-[150px] object-cover">
                    <Image
                      src={m.content}
                      alt="message"
                      height={100}
                      width={100}
                      className="w-[150px] h-[150px] object-cover bg-transparent"
                    />
                  </div>
                )}

                {m.type === ChannelMessageType.PDF && (
                  <a
                    className="text-sky-400 hover:text-sky-700"
                    target="_blank"
                    href={m.content}
                  >
                    Pdf File Link
                  </a>
                )}

                <p className="text-xs text-zinc-400 pt-1">
                  {format(new Date(m.createdAt), DATE_FORMAT)}{" "}
                </p>
              </div>

              <MoreVertical className="ml-auto" />
            </div>
          ))}
      </div>
    </div>
  );
};
