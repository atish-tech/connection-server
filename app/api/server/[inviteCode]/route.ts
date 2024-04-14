import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { StatusCode } from "@/lib/status";
import { create } from "domain";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:Request , { params }: { params: { inviteCode: string } }) {
    try {
        const token = cookies().get("token")?.value || " ";

        if (!token) return new NextResponse("Bad Request", { status: StatusCode.BadRequest });

        const email = await decodeToken(token);

        const body = await req.body;

        const user = await DB.user.findFirst({ where: { email } });

        // Validate User
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const {inviteCode} = params;

        const server = await DB.server.update({
            where:{
                inviteCode   
            } ,
            data: {
                members : {
                    create: [
                        { userId: user.id }
                    ]
                }
            }
        })
        
        // console.log(server);
        

        return new NextResponse("success" , {status: StatusCode.Created});
        
    } catch (error) {
        console.log(error);
        return new NextResponse("error" , {status: StatusCode.BadRequest});
        
    }
}