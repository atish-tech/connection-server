import { create } from "zustand";

export type SheetActionType = "serverChannel";

interface Data {
  serverId?: string;
}

export interface SheetAction {
  isOpen: boolean;
  type: SheetActionType | null;
  data?: Data;
  onOpen: (type: SheetActionType, data?: Data) => void;
  onClose: () => void;
}
export const useSheetAction = create<SheetAction>((set) => ({
  isOpen: false,
  type: null,
  data: {},
  onOpen: (type: SheetActionType, data = {}) =>
    set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null }),
}));
