import * as Minio from 'minio';

// Initialize MinIO client with configuration
export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export const MINIO_BUCKET_NAME:string = process.env.MINIO_BUCKET_NAME || 'test-bucket';

// Create bucket if it doesn't exist
export const initializeMinio = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    
    if (!bucketExists) {
      await minioClient.makeBucket(MINIO_BUCKET_NAME, process.env.MINIO_REGION || 'us-east-1');
      console.log(`Bucket '${MINIO_BUCKET_NAME}' created successfully`);
    } else {
      console.log(`Bucket '${MINIO_BUCKET_NAME}' already exists`);
    }
    return true;
  } catch (error) {
    console.error('Error initializing MinIO:', error);
    return false;
  }
};

// Helper to generate a presigned URL for object viewing
export const getPresignedUrl = async (objectName: string): Promise<string> => {
  try {
    return await minioClient.presignedGetObject(MINIO_BUCKET_NAME, objectName, 24 * 60 * 60); // 24 hours expiry
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

// List all objects in a bucket with optional prefix
export const listObjects = async (prefix: string = ''): Promise<Minio.BucketItem[]> => {
  return new Promise((resolve, reject) => {
    const objectsList: Minio.BucketItem[] = [];
    const stream = minioClient.listObjects(MINIO_BUCKET_NAME, prefix, true);
    
    stream.on('data', (obj) => {
      if (obj.name) {  // Ensure name exists before adding to list
        objectsList.push(obj as Minio.BucketItem);
      }
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(objectsList));
  });
};

// Upload file to MinIO
export const uploadFile = async (file: File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const objectName = `${Date.now()}-${file.name}`;
      
      await minioClient.putObject(
        MINIO_BUCKET_NAME,
        objectName,
        buffer,
        buffer.length,
        { 'Content-Type': file.type }
      );
      
      resolve(objectName);
    } catch (error) {
      reject(error);
    }
  });
};

// Delete an object from MinIO
export const deleteObject = async (objectName: string): Promise<void> => {
  try {
    await minioClient.removeObject(MINIO_BUCKET_NAME, objectName);
  } catch (error) {
    console.error('Error deleting object:', error);
    throw error;
  }
};
