"use client";

import { RefObject, useEffect, useRef } from "react";
import { MessageState, useMessageStore } from "@/hooks/use-message-store";
import { MessageSkeletonGroup } from "../skelton/MessageSkelton";
import { Button } from "../ui/button";
import { Chat } from "./chat";

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
          messages?.map((m: any) => <Chat chat={m} key={m.id} />)}
      </div>
    </div>
  );
};
