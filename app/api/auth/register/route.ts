import { NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { StatusCode } from "@/lib/status";
import { verifyEmail } from "@/components/auth/email";
import { cookies } from "next/headers";
import { getToken } from "@/config/generateToken";
import { JwtPayload } from "jsonwebtoken";

interface RequestBody {
  userName: string;
  email: string;
  password: string;
}

export async function POST(req: Request, res: Response) {
  const data = await req.json();

  const { userName, email, password }: RequestBody = data;

  const crediencial = new URL(req.url);

  const type = crediencial.searchParams.get("type");

  const origin = crediencial.origin;

  const userData = await DB.user.findFirst({
    where: { OR: [{ email }, { userName }] },
  });

  // login
  if (type === "login") {
    if (!userData)
      return new NextResponse("Email not exist", {
        status: StatusCode.BadRequest,
      });
    else if (userData?.email === email) {
      // Check Password
      if (!(await bcryptjs.compare(password, userData?.password)))
        return new NextResponse("Incorrect password", {
          status: StatusCode.BadRequest,
        });
      // check user verivied or not
      else if (!userData.isVerified) {
        return new NextResponse("Email Not verified", {
          status: StatusCode.BadRequest,
        });
      }

      //  login procedure
      else {
        const token = await getToken(userData.email);
        cookies().set("token", token);

        return new NextResponse("Login Success", {
          status: StatusCode.Success,
        });
      }
    } else if (userData?.userName !== userName)
      return new NextResponse("Incorrect UserName", {
        status: StatusCode.BadRequest,
      });
    else if (userData?.email !== email)
      return new NextResponse("Incorrect Email", {
        status: StatusCode.BadRequest,
      });
  }

  // register
  if (type === "register") {
    if (userData) {
      if (!userData?.isVerified) {
        verifyEmail(userData.email, origin);
        return new NextResponse(
          "Varification link send to your register email",
          { status: StatusCode.Success }
        );
      }
      if (userData?.userName == userName)
        return new NextResponse("User Name already exist", { status: 400 });
      if (userData?.email == email)
        return new NextResponse("Email already exist", { status: 400 });
    }

    // Password encription
    const hashPassword = await bcryptjs.hash(
      password,
      await bcryptjs.genSalt(10)
    );

    // create entry in Database
    const response = await DB.user.create({
      data: { userName, email, password: hashPassword },
    });

    // send email
    verifyEmail(response.email, origin);

    return NextResponse.json(
      "Registration Success , Please verify your email",
      { status: StatusCode.Created }
    );
  }
}
