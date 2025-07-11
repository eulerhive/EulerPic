import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

const BUCKET = process.env.AWS_S3_BUCKET;

export function getS3Key(userId, filename, type = 'originals') {
  return `user-${userId}/${type}/${filename}`;
}

export function getPresignedUploadUrl({ userId, filename, mimeType, type = 'originals' }) {
  const Key = getS3Key(userId, filename, type);
  const params = {
    Bucket: BUCKET,
    Key,
    ContentType: mimeType,
    Expires: 60 * 5, // 5 minutes
  };
  return s3.getSignedUrlPromise('putObject', params);
}

export function getPresignedDownloadUrl({ userId, filename, type = 'originals', s3KeyOverride }) {
  const Key = s3KeyOverride || getS3Key(userId, filename, type);
  const params = {
    Bucket: BUCKET,
    Key,
    Expires: 60 * 10, // 10 minutes
  };
  return s3.getSignedUrlPromise('getObject', params);
}

export async function deleteFromS3(key) {
  const params = {
    Bucket: BUCKET,
    Key: key,
  };
  return s3.deleteObject(params).promise();
} 