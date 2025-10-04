import { NextRequest, NextResponse } from "next/server";
import { deleteObject } from "@/utils/minio";

export async function DELETE(req: NextRequest) {
  try {
    const fileName: string | null = req.nextUrl.searchParams.get("fileName");
    
    if (!fileName) {
      return NextResponse.json(
        { error: "No file name provided" },
        { status: 400 }
      );
    }
    
    // Delete the object from MinIO
    await deleteObject(fileName);
    
    return NextResponse.json({
      success: true,
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting from MinIO:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
