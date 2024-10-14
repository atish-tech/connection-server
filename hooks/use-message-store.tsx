import { ChannelMessageType } from "@prisma/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import axios from "axios";
import {
  Dispatch,
  FormEvent,
  MouseEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import { toast } from "sonner";
import { create } from "zustand";

export interface MessageState {
  messages: { content: any }[];
  loading: boolean;
  messageLoading: boolean;
  page: number;
  getMessages: (params: { channelId: number; page?: number }) => Promise<void>;
  sendMessage: (params: {
    message: string;
    messageType?: ChannelMessageType;
    setMessage: Dispatch<SetStateAction<string>>;
    channelId: number;
    serverId: string;
    e:
      | FormEvent<HTMLFormElement>
      | MouseEvent<SVGSVGElement>
      | MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;
  }) => Promise<void>;
  addMessage: (message: { content: any }) => void;
  setLoading: (loading: boolean) => void;
  channel: MutableRefObject<RealtimeChannel | null>;
  setChannel: (channel: RealtimeChannel | null) => void;
  incrementPage: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,
  messageLoading: false,
  page: 1,
  channel: { current: null },

  getMessages: async ({ channelId, page = 1 }) => {
    try {
      set({ messageLoading: true });

      const response = await axios.post(
        `/api/channel/message/getMessage/?channelId=${channelId}&page=${page}`
      );

      if (page === 1) {
        set({ messages: response.data });
      } else {
        if (response.data.length === 0) {
          toast.info("No more messages to load.");

          return;
        }

        set((state) => ({ messages: [...response.data, ...state.messages] }));
      }
    } catch (error) {
      console.log(error);
      toast.error("Error on getting message.");
    } finally {
      set({ messageLoading: false });
    }
  },

  sendMessage: async ({
    message,
    messageType = ChannelMessageType.TEXT,
    setMessage,
    channelId,
    serverId,
    e,
  }) => {
    e.preventDefault();

    if (message == "") return;

    try {
      set({ loading: true });

      const { channel } = get();

      const data = {
        content: message,
        channelId,
        serverId,
        type: messageType,
      };

      const sendMessageResponse = await axios.post(
        "/api/channel/message",
        data
      );

      if (channel.current) {
        channel.current.send({
          type: "broadcast",
          event: "message",
          payload: { message: sendMessageResponse?.data },
        });
      }

      setMessage("");
    } catch (error) {
      console.log(error);
      toast.error("Server Error");
    } finally {
      set({ loading: false });
    }
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  setLoading: (loading) => set({ loading }),

  setChannel: (channel: RealtimeChannel | null) => {
    set({ channel: { current: channel } });
  },

  incrementPage: () => {
    set((state) => ({ page: state.page + 1 }));
  },
}));
