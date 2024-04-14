import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "./config/decodeToken";
import { redirect } from "next/navigation";
import { StatusCode } from "./lib/status";
import { DB } from "./lib/prisma";

export async function middleware(request: NextRequest) {
    // if(request.nextUrl.pathname.startsWith("/login") && ! request.nextUrl.pathname.startsWith("/register")) {
    const token = cookies().get("token")?.value || ""; // Provide a default value for token
    const email = await decodeToken(token);

    if (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")) {
    }
    else if (!email) {
        NextResponse.redirect(new URL("/login", request.url))
        return;

    }
    else {
        // const user = await DB.user.findFirst({where: {email}});
        // console.log(user);
        // request.email = email;
    }
    // console.log(email);
    // return new NextResponse("User Unothrized" , {status: StatusCode.BadRequest});
    // }
}