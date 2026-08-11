import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'growix';
const R2_REGION = process.env.R2_REGION || 'auto';

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
