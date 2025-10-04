import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/utils/minio";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const fileName = req.nextUrl.searchParams.get("fileName");
    
    if (!fileName) {
      return NextResponse.json(
        { error: "No file name provided" },
        { status: 400 }
      );
    }
    
    // Generate a presigned URL for the file
    const url = await getPresignedUrl(fileName);
    
    return NextResponse.json({
      success: true,
      url,
      fileName
    });
  } catch (error) {
    console.error("Error generating URL:", error);
    return NextResponse.json(
      { error: "Failed to generate URL" },
      { status: 500 }
    );
  }
}
