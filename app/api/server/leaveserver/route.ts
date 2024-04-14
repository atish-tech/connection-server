import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { StatusCode } from "@/lib/status";
import { MemberRole } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {

    try {

        const token = cookies().get("token")?.value || " ";

        if (!token) return new NextResponse("User Not verified", { status: StatusCode.BadRequest });

        const email = await decodeToken(token);

        const body = await req.json();

        const user = await DB.user.findFirst({ where: { email } });

        // Validate User
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { serverId, memberRole } = body;

        const member = await DB.member.findFirst({
            where: {
                userId: user.id,
                serverId,
                role: {not: MemberRole.ADMIN}
            },
        });

        console.log(member);
        await DB.member.delete({
            where: {id: member?.id}
        })
        

        return NextResponse.json("You Leave the server")

    } catch (error) {
        console.log(error);
        return new NextResponse("Server Error", { status: StatusCode.Error })
    }
}