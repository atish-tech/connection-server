import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { StatusCode } from "@/lib/status";
import { ChannelType, MemberRole } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { string, z } from "zod";

const ChannelInputSchema = z.object({
    name: string().min(2, { message: "Channel name must be at list 2 charecter" }),
    type: string(),
    serverId: string()
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

        const { name, serverId, type } = body;

        // Create channel
        const channel = await DB.server.update({
            where: {
                id:serverId ,
                members: {
                    some:{
                        userId: user.id,
                        role: {
                            in:[MemberRole.ADMIN , MemberRole.MODERATOR]
                        }
                    } 
                }
            },
            data: {
                channels:{ 
                    create: {
                        name: name,
                        type: type
                    }
                }
            }
        })

        return NextResponse.json(channel);
    } catch (error:any) {
        console.log(error.meta.cause);
        return new NextResponse(error.meta.cause, { status: StatusCode.Error });
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

        const channels = await DB.server.findMany({
            where: {
                id: serverId
            },
            include: {
                channels: true
            
            }
        })

        return NextResponse.json(channels);
    } catch (error) {
        console.log(error);
        return new NextResponse("Server Error", { status: StatusCode.Error });
    }
}

export async function DELETE(req: Request) {
    try {
        const token = cookies().get("token")?.value || " ";

        if (!token) return new NextResponse("Bad Request", { status: StatusCode.BadRequest });

        const email = await decodeToken(token);

        const user = await DB.user.findFirst({ where: { email } });

        // Validate User
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { channelId , serverId} = body;

        const channel = await DB.channel.delete({
            where: {
                id: channelId,
                serverId
            }
        })

        return new NextResponse("Channel Deleted", { status: StatusCode.Success });
    } catch (error) {
        console.log(error);
        return new NextResponse("Server Error", { status: StatusCode.Error });
    }
}

export async function PUT(req: Request) {
    try {
        const token = cookies().get("token")?.value || " ";

        if (!token) return new NextResponse("Bad Request", { status: StatusCode.BadRequest });

        const email = await decodeToken(token);

        const user = await DB.user.findFirst({ where: { email } });

        // Validate User
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { channelId , serverId, name } = body;

        const channel = await DB.channel.update({
            where: {
                id: channelId,
                serverId
            },
            data: {
                name
            }
        });        

        return new NextResponse("Channel Updated", { status: StatusCode.Success });
    } catch (error) {
        console.log(error);
        return new NextResponse("Server Error", { status: StatusCode.Error });
    }
}