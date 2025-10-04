"use client";

import { CreateChannelDrawer } from "../channel/create-channel";
import { DeleteServer } from "../server/delete-server";
import { EditProfileDrawer } from "../action/edit-profile-drawer";
import { InvitePeople } from "../server/invite-people";
import { LeaveServer } from "../server/leave-server";
// File uploads are now handled directly in the message input
import { ServerMembers } from "../server/server-member";
import { EditServer } from "../server/edit-server";
import { CreateServer } from "../server/create-server";

export const DrawerProvider = () => {
  return (
    <>
      <CreateServer />
      <CreateChannelDrawer />
      <InvitePeople />
      <ServerMembers />
      <EditServer />
      <DeleteServer />
      <LeaveServer />
      {/* File uploads are now handled directly in message input */}
      <EditProfileDrawer />
    </>
  );
};
