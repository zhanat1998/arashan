import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 Client
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Upload file to R2
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return public URL
  return `${R2_PUBLIC_URL}/${fileName}`;
}

// Delete file from R2
export async function deleteFromR2(fileName: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileName,
  });

  await r2Client.send(command);
}

// Generate unique filename
export function generateFileName(userId: string, originalName: string, type: 'image' | 'video'): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || (type === 'video' ? 'mp4' : 'jpg');
  return `${type}s/${userId}/${timestamp}-${randomString}.${extension}`;
}