import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { StatusCode } from "@/lib/status";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { MemberRole } from "@prisma/client";

const ServerInputSchema = z.object({
    name: z.string().min(2, { message: "Name Must be at list 2 charecter long" }),
    imageUrl: z.string().min(2, { message: "Image url is missing" }),
})

export async function POST(req: Request) {
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
        
        // validate body
        const verifiedBody = ServerInputSchema.safeParse(body);
        if (!verifiedBody.success) {
            return new NextResponse(verifiedBody.error.errors[0].message, { status: StatusCode.BadRequest });
        }
        
        const { name, imageUrl } = body;

        const server = await DB.server.create({
            data: {
                name, imageUrl,
                adminId: user?.id,
                inviteCode: uuidv4(),
                members: {
                    create: [
                        { userId: user.id, role: MemberRole.ADMIN }
                    ]
                },
                channels: {
                    create: [
                        {name : "general"},
                    ]
                }
                
            }
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log(error);
        return new NextResponse("server error", { status: StatusCode.BadRequest });

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

        const servers = await DB.server.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id
                    }
                }
            }
        });

        return NextResponse.json(servers);
    } catch (error) {
        console.log(error);
        return new NextResponse("server error", { status: StatusCode.BadRequest });

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

        const crediencial = new URL(req.url);
        const serverId = crediencial.searchParams.get("serverId") || "";
        console.log(serverId);
        
        await DB.server.delete({
            where: {
                id: serverId,
                adminId: user.id
            }
        });

        return new NextResponse("Server Deleted" , {status : StatusCode.Success});
    } catch (error) {
        console.log(error);
        return new NextResponse("server error", { status: StatusCode.BadRequest });

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

        const crediencial = new URL(req.url);
        const serverId = crediencial.searchParams.get("serverId") || "";
        const body = await req.json();
        
        const server = await DB.server.update({
            where: {
                id: serverId,
                adminId: user.id
            },
            data: body
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log(error);
        return new NextResponse("server error", { status: StatusCode.BadRequest });

    }
}