import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { StatusCode } from "@/lib/status";
import {  NextResponse } from "next/server";
// import { JwtPayload } from "jsonwebtoken"; // Import the JwtPayload type

export async function POST(req: Request) {
    const token = (new URL(req.url).searchParams.get("token")) || "";

    const decode:any = await decodeToken(token);

    if(!decode) {
        return new NextResponse("Token Expire" , {status : StatusCode.BadRequest})
    }
    
    await DB.user.updateMany({
       where:{
        email: decode.id
       },
       data: {
        isVerified: true
       }
    });   

    return new NextResponse("Success" , {status : StatusCode.Success});
}