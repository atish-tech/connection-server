"use client";

import { CreateChannelDrawer } from "../action/create-channel";
import { CreateServerDrawer } from "../action/create-server-drawer";
import { DeleteServer } from "../action/delete-server";
import { EditProfileDrawer } from "../action/edit-profile-drawer";
import { EditServer } from "../action/edit-server";
import { InvitePeople } from "../action/invite-people";
import { LeaveServer } from "../action/leave-server";
import { SendMessageDrawer } from "../action/send-image-drawer";
import { SendPdfDrawer } from "../action/send-pdf-drawer";
import { ServerMembers } from "../action/server-member";


export const DrawerProvider = () => {
    return (
        <>
            <CreateServerDrawer />
            <CreateChannelDrawer />
            <InvitePeople />
            <ServerMembers />
            <EditServer />
            <DeleteServer />
            <LeaveServer />
            <SendMessageDrawer />
            <SendPdfDrawer />
            <EditProfileDrawer />
        </>
    )
}