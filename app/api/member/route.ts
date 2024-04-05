import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { StatusCode } from "@/lib/status";
import { ChannelType, MemberRole } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { string, z } from "zod";

const ChannelInputSchema = z.object({
    serverId: string().min(5, { message: "Invalid Server Id" }),
});

export async function POST(req: Request) {
    try {
        const token = cookies().get("token")?.value || " ";

        if (!token) return new NextResponse("Bad Request", { status: StatusCode.BadRequest });

        const email = await decodeToken(token);

        const body = await req.json();

        const user = await DB.user.findFirst({ where: { email } });

        // Validate User
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // validate body
        const verifiedBody = ChannelInputSchema.safeParse(body);
        if (!verifiedBody.success) {
            return new NextResponse(verifiedBody.error.errors[0].message, { status: StatusCode.BadRequest });
        }

        const { serverId } = body;
        const role: MemberRole = body.role

        const channel = await DB.member.create({
            data: {
                userId: user.id, serverId, role
            }
        })

        return NextResponse.json(channel);
    } catch (error) {
        console.log(error);
        return new NextResponse("Server Error", { status: StatusCode.Error });
    }
}

export async function GET(req: Request) {
    try {
        const token = cookies().get("token")?.value || " ";

        if (!token) return new NextResponse("Bad Request", { status: StatusCode.BadRequest });

        const email = await decodeToken(token);

        const user = await DB.user.findFirst({ where: { email } });

        // Validate User
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const crediencial = new URL(req.url);
        const serverId = crediencial.searchParams.get("serverId") || "";

        const member = await DB.server.findFirst({
            where: {
                id: serverId,
            },
            include: {
                members: true
            }
        })

        return NextResponse.json(member);
    } catch (error) {
        console.log(error);

        return new NextResponse("error", { status: StatusCode.BadRequest })

    }
}