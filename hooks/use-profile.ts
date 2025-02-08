import { User } from "@prisma/client";
import { create, StoreApi, UseBoundStore } from "zustand";

export interface UseProfileType {
  profile: User
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
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "USER",
      password: "",
    },
    setProfile: (profile: User) => set({ profile }),
  }));
