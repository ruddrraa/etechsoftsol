import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getAwsSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "excel-analytics";

let s3Client: S3Client | null = null;

if (accountId && accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Generates a unique key for an R2 object based on hospital ID and timestamp.
 */
export function generateR2Key(hospitalId: string, originalFilename: string, folder: "uploads" | "exports" | "reports" = "uploads"): string {
  const timestamp = Date.now();
  const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `hospitals/${hospitalId}/${folder}/${timestamp}-${safeFilename}`;
}

/**
 * Uploads a file buffer directly to Cloudflare R2.
 * @returns The object key to be stored in MongoDB.
 */
export async function uploadFileToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  if (!s3Client) throw new Error("R2 is not configured");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;
}

/**
 * Generates a signed URL for secure, temporary access to a private file.
 * The URL expires in 1 hour by default.
 */
export async function getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  if (!s3Client) throw new Error("R2 is not configured");

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getAwsSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes a file from R2.
 */
export async function deleteFileFromR2(key: string): Promise<void> {
  if (!s3Client) throw new Error("R2 is not configured");

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}
