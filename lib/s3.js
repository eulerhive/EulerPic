import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function getUserMediaKeys(userId) {
  const prefix = `users/${userId}/`;
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  });
  const data = await s3.send(command);
  return (data.Contents || [])
    .map(obj => ({
      key: obj.Key,
      lastModified: obj.LastModified,
      size: obj.Size,
      // ContentType is not available in ListObjectsV2, but we can infer from extension
    }))
    .filter(obj => obj.key && !obj.key.includes('/thumbnails/'));
}

export async function getPresignedUploadUrl(userId, filename, contentType) {
  const key = `users/${userId}/${filename}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
  return { url, key };
}

export async function getPresignedDownloadUrl(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 60 * 10 });
} 