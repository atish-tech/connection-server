import { ServerToast } from "@/components/util/server-toast";
import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const InviteCode = async ({ params }: { params: { inviteCode: string } }) => {
  const token = cookies().get("token")?.value || " ";

  if (!token) return redirect("/login");

  const email = await decodeToken(token);

  const user = await DB.user.findFirst({
    where: { email },
    select: { id: true, email: true, userName: true, isVerified: true },
  });

  // Validate User
  if (!user) return redirect("/login");

  const existingMember = await DB.member.findFirst({
    where: {
      userId: user.id,
      server: {
        inviteCode: params.inviteCode,
      },
    },
  });
  // console.log(existingMember);

  if (!existingMember) {
    try {
      await DB.server.update({
        where: {
          inviteCode: params.inviteCode,
        },
        data: {
          members: {
            create: [{ userId: user.id }],
          },
        },
      });
      // toast.success("You are added in the server");
    } catch (error) {
      console.log(error);
      // toast.error("Server Error! Try Again :(");
    }
  }

  return redirect(`/`);
};

export default InviteCode;
