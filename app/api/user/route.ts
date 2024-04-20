import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { StatusCode } from "@/lib/status";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

const UserSchema = z.object({
    imageUrl: z.string().min(0, { message: "Please provide an image" }),
    userName: z.string().min(2, { message: "Please provide a server name" }),
    email: z.string().email({ message: "Please provide a valid email" }),
  });

export async function PUT(req: Request) {
    try {
        
        const token = cookies().get("token")?.value || " ";
        
        if (!token) return new NextResponse("User Not verified", { status: StatusCode.BadRequest });
        
        const userEmail = await decodeToken(token);
        
        const body = await req.json();
        
        const user = await DB.user.findFirst({ where: { email : userEmail} });
        
        // Validate User
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        // validate body
        const verifiedBody = UserSchema.safeParse(body);
        if (!verifiedBody.success) {
            return new NextResponse(verifiedBody.error.errors[0].message, { status: StatusCode.BadRequest });
        }
        
        const { userName , email , imageUrl } = body;

        const updatedUser = await DB.user.update({
            where : {
                id: user.id
            },
            data:{
                userName , email , imageUrl
            }
        })


        return NextResponse.json(updatedUser);
    } catch (error) {
        console.log(error);
        return new NextResponse("server error", { status: StatusCode.BadRequest });

    }
}