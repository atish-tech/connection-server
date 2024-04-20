"use client";

import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ChannelMessageType } from "@prisma/client";
import { MoreVertical, User } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
const DATE_FORMAT = "d MMM yyyy, HH:mm";

export const ChannelChat = ({
  channelId,
  data,
  setData,
}: {
  channelId: number;
  data: any;
  setData: any;
}) => {
  const getMessage = async () => {
    try {
      const response = await axios.post(
        `/api/channel/message/getMessage/?channelId=${channelId}`
      );
      setData(response.data);

      // console.log(data);
    } catch (error) {
      console.log(error);
      toast.error("Error on getting message.");
    }
  };


  useEffect(() => {
    getMessage();
  }, []);
  return (
    <div className="w-full h-full flex overflow-auto text-white">
      <div className="flex flex-col mt-auto gap-4 w-full ">
        {data.length > 0 &&
          data?.map((m: any) => (
            <div
              key={m.id}
              className="flex items-center h-full hover:bg-zinc-800 p-3 gap-3 w-full"
            >
              <User />
              {/* Content */}
              <div >
                {/* user name */}
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
