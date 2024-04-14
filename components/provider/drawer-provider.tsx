"use client";

import { CreateChannelDrawer } from "../action/create-channel";
import { CreateServerDrawer } from "../action/create-server-drawer";
import { DeleteServer } from "../action/delete-server";
import { EditServer } from "../action/edit-server";
import { InvitePeople } from "../action/invite-people";
import { LeaveServer } from "../action/leave-server";
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
        </>
    )
}