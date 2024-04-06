import { create } from "zustand";

export type DrawerActionType = "createServer";

interface DrawerAction {
    isOpen: boolean;
    type: DrawerActionType | null;
    onOpen: (type: DrawerActionType) => void;
    onClose: () => void;
}
export const useDrawerAction = create<DrawerAction>((set) => ({
    isOpen: false,
    type: null,
    onOpen: (type: DrawerActionType) => set({ isOpen: true, type }),
    onClose: () => set({ isOpen: false, type: null }),
}));