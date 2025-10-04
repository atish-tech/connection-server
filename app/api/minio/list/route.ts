import { NextRequest, NextResponse } from "next/server";
import { listObjects, getPresignedUrl } from "@/utils/minio";
import { BucketItem } from "minio";

export async function GET(req: NextRequest) {
  try {
    // List all objects in the bucket
    const objects: BucketItem[] = await listObjects();
    
    // Get presigned URLs for each object
    const files = await Promise.all(
      objects.map(async (obj) => {
        try {
          if (!obj.name) {
            throw new Error("Object name is undefined");
          }
          const url = await getPresignedUrl(obj.name);
          return {
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            url: url
          };
        } catch (error) {
          console.error(`Error generating URL for ${obj.name}:`, error);
          return {
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            url: null
          };
        }
      })
    );

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing MinIO objects:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
