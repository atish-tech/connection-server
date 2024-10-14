import { decodeToken } from "@/config/decodeToken";
import { DB } from "@/lib/prisma";
import { StatusCode } from "@/lib/status";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const token = cookies().get("token")?.value || " ";

    if (!token)
      return new NextResponse("Bad Request", { status: StatusCode.BadRequest });

    const email = await decodeToken(token);

    const user = await DB.user.findFirst({ where: { email } });

    // Validate User
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const crediencial = new URL(req.url);

    const channelId = parseInt(
      crediencial.searchParams.get("channelId") ?? "0"
    );

    const page = parseInt(crediencial.searchParams.get("page") ?? "1");
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const messages = await DB.channelMessage.findMany({
      where: { channelId },
      orderBy: { createdAt: "asc" },
      skip,
      take: pageSize,
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.log(error);
    return new NextResponse("Server Error", { status: StatusCode.Error });
  }
}
