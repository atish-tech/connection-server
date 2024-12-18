import { User } from "@prisma/client";
import { create } from "zustand";

export interface UseProfileType {
  profile: Omit<User, "password" | "createdAt" | "updatedAt">;
  setProfile: (profile: User) => void;
}

export const useProfileStore = create<UseProfileType>((set) => ({
  profile: {
    userName: "",
    email: "",
    imageUrl: "",
    id: "",
    isVerified: false,
  },
  setProfile: (profile: User) => set({ profile }),
}));
