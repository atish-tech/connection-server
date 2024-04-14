// create server hook

import { create } from "zustand";

export type ServerStructure = {
    serverName: string | null;
    imageUrl: string | null;
};

export const useCreateServer = create<ServerStructure>((set) => ({
    serverName: null,
    imageUrl: null,
    setServerName: (serverName: string | null) => set({ serverName }),
    setImageUrl: (imageUrl: string | null) => set({ imageUrl }),
}));

