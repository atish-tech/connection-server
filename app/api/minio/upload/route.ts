import { NextRequest, NextResponse } from "next/server";
import { minioClient, MINIO_BUCKET_NAME } from "@/utils/minio";

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const formData: FormData = await req.formData();
    const file: File = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const buffer: Buffer = Buffer.from(await file.arrayBuffer());
    const objectName: string = `${Date.now()}-${file.name}`;
    
    // Upload to MinIO
    await minioClient.putObject(
      process.env.MINIO_BUCKET_NAME || 'test-bucket',
      objectName,
      buffer,
      buffer.length,
      { 'Content-Type': file.type }
    );
    
    return NextResponse.json({
      success: true,
      objectName,
      message: "File uploaded successfully"
    });
  } catch (error) {
    console.error("Error uploading to MinIO:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
