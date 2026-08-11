const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const client = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
  console.log('Connecting to Cloudflare R2 Bucket:', process.env.R2_BUCKET_NAME);
  try {
    const cmd = new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME });
    const res = await client.send(cmd);
    console.log('Objects found in R2:', res.Contents ? res.Contents.length : 0);
    if (res.Contents) {
      res.Contents.forEach((item) => {
        const sizeMb = (item.Size / (1024 * 1024)).toFixed(2);
        console.log(`Key: "${item.Key}" | Size: ${sizeMb} MB (${item.Size} bytes) | Modified: ${item.LastModified}`);
      });
    }
  } catch (err) {
    console.error('R2 scan error:', err);
  }
}

run();
