import { User } from "@prisma/client";
import { create, StoreApi, UseBoundStore } from "zustand";

export interface UseProfileType {
  profile: Omit<User, "password" | "createdAt" | "updatedAt">;
  setProfile: (profile: User) => void;
}

export const useProfileStore: UseBoundStore<StoreApi<UseProfileType>> =
  create<UseProfileType>((set) => ({
    profile: {
      userName: "",
      email: "",
      imageUrl: "",
      id: "",
      isVerified: false,
    },
    setProfile: (profile: User) => set({ profile }),
  }));
