import { NextRequest, NextResponse } from "next/server";
import { minioClient, MINIO_BUCKET_NAME, getPresignedUrl, deleteObject } from "@/utils/minio";

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "general";
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Generate a folder structure based on file type
    let folder = "";
    switch (type) {
      case "image":
        folder = "images/";
        break;
      case "video":
        folder = "videos/";
        break;
      case "pdf":
        folder = "documents/";
        break;
      default:
        folder = "files/";
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const objectName = `${folder}${Date.now()}-${file.name}`;
    
    // Upload to MinIO
    await minioClient.putObject(
      MINIO_BUCKET_NAME,
      objectName,
      buffer,
      buffer.length,
      { 'Content-Type': file.type }
    );
    
    // Generate a URL for the uploaded file
    const url = await getPresignedUrl(objectName);
    
    return NextResponse.json({
      success: true,
      objectName,
      url,
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

export async function DELETE(req: NextRequest) {
  try {
    const fileName = req.nextUrl.searchParams.get("fileName");
    
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

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get("action");
    const fileName = req.nextUrl.searchParams.get("fileName");
    
    if (action === "url" && fileName) {
      // Generate a URL for the file
      const url = await getPresignedUrl(fileName);
      return NextResponse.json({ url, fileName });
    }
    
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
