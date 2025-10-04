import { NextRequest, NextResponse } from "next/server";
import { initializeMinio } from "@/utils/minio";

export async function GET(req: NextRequest) {
  try {
    // Initialize MinIO (create bucket if it doesn't exist)
    const success = await initializeMinio();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: "MinIO initialized successfully"
      });
    } else {
      return NextResponse.json(
        { error: "MinIO initialization failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error initializing MinIO:", error);
    return NextResponse.json(
      { error: "MinIO initialization failed" },
      { status: 500 }
    );
  }
}
