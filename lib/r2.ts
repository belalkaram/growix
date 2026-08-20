import { S3Client, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'growix';
const R2_REGION = process.env.R2_REGION || 'auto';
const R2_CUSTOM_DOMAIN = process.env.R2_CUSTOM_DOMAIN || process.env.NEXT_PUBLIC_R2_DEV_URL || '';

export function getR2Client(): S3Client {
  return new S3Client({
    region: R2_REGION,
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload a payment proof screenshot to Cloudflare R2 inside receipts/ folder.
 */
export async function uploadReceiptToR2(
  buffer: Buffer,
  fileKey: string,
  contentType = 'image/png'
): Promise<{ success: boolean; key: string; url: string; error?: string }> {
  try {
    const client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
    });

    await client.send(command);

    // Build accessible URL
    const baseUrl = R2_CUSTOM_DOMAIN.replace(/\/$/, '');
    const url = baseUrl ? `${baseUrl}/${fileKey}` : `https://files.growix.belalkaram.dev/${fileKey}`;

    return { success: true, key: fileKey, url };
  } catch (error: any) {
    console.error('Error uploading receipt to R2:', error);
    return { success: false, key: fileKey, url: '', error: error.message || 'Failed to upload to R2' };
  }
}

/**
 * Delete a payment proof receipt image from Cloudflare R2 to save space.
 */
export async function deleteReceiptFromR2(fileKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });

    await client.send(command);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting receipt from R2:', error);
    return { success: false, error: error.message || 'Failed to delete from R2' };
  }
}

/**
 * Generate a temporary secure presigned download URL for a file stored in Cloudflare R2.
 * @param fileKey Key of the file in R2 bucket (e.g. "facebook-bot.zip")
 * @param expiresIn Expiration time in seconds (default: 300 = 5 minutes)
 */
export async function generatePresignedDownloadUrl(fileKey: string, expiresIn = 300): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });

  return await getSignedUrl(client, command, { expiresIn });
}

/**
 * List all objects currently stored in the R2 bucket.
 */
export async function listR2Objects(prefix?: string) {
  const client = getR2Client();
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
  });

  try {
    const response = await client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing R2 objects:', error);
    return [];
  }
}
