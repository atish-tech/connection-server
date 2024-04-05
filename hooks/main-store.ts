import { ChannelType, MemberRole } from "@prisma/client";
import { create } from "zustand";




// export type MemberStructure = { id: number; userId: string; serverId: string; role: MemberRole }

// export type ChannelStructure = { id: string; name: string; serverId: string; type: ChannelType }

// export type ServerStructure = {
//     id: string | null;
//     name: string | null;
//     adminId: string | null;
//     imageUrl: string | null;
//     members: [MemberStructure] | [];
//     channels: [ChannelStructure] | [];
//     createdAt: string | null;
//     updatedAt: string | null;
// };

// export const  useLocalServerData = create<ServerStructure>((set) => (
// data : [{id: null,
//     name: null,
//     adminId: null,
//     imageUrl: null,
//     members: [],
//     channels: [],
//     createdAt: null,
//     updatedAt: null}] => set(data) 
// ))


// export const useServerModel = create<ServerStructure>((set) => ({
//     data: [{
//         id: null,
//         name: null,
//         adminId: null,
//         imageUrl: null,
//         members: [],
//         channels: [],
//         createdAt: null,
//         updatedAt: null,
//     }],
//     setServerModel: (data: ServerStructure) => set(data),
// }));

export type UserStructure = {
    id: string;
    email?: string;
    userName?: string;
    isVerified?: boolean;
}
export type UserModel = {
    data: UserStructure  | null;
    setUserModel: (data?: UserStructure) => void;
    getUserModel: any;
};

export const useUserModel = create<UserModel>((set) => ({
    data: {
        id: "",
        email: "",
        userName: "",
        isVerified: false,
    },
    setUserModel: (state?: UserStructure) => set({data : state} ),
    getUserModel: () => set,
}));