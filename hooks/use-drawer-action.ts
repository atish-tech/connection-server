import { Channel, ChannelType, Member, Server, User } from "@prisma/client";
import { create } from "zustand";

export type DrawerActionType =
  | "createServer"
  | "createChannel"
  | "invitePeople"
  | "serverMembers"
  | "editServer"
  | "deleteServer"
  | "leaveServer"
  | "sendImage"
  | "sendPdf"
  | "editProfile";

interface Data {
  server?: Server | null;
  channel?: Channel;
  user?: User;
  channelType?: ChannelType;
  member?: Member[];
  id?: any;
  data?: {
    serverId?: string | null;
    memberRole?: string | null;
    channelId?: number | null;
  };
}

export interface DrawerAction {
  isOpen: boolean;
  type: DrawerActionType | null;
  data?: Data;
  onOpen: (type: DrawerActionType, data?: Data) => void;
  onClose: () => void;
}
export const useDrawerAction = create<DrawerAction>((set) => ({
  isOpen: false,
  type: null,
  data: {}, // Provide an initializer for the 'data' property
  onOpen: (type: DrawerActionType, data = {}) =>
    set({ isOpen: true, type, data }), // Add initializer for 'data'
  onClose: () => set({ isOpen: false, type: null }),
}));
