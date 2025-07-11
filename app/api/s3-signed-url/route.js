import { S3Client, PutObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  console.debug('[S3-SIGNED-URL][POST] Incoming request');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.debug('[S3-SIGNED-URL][POST] Unauthorized');
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const body = await req.json();
  console.debug('[S3-SIGNED-URL][POST] Body:', body);

  // Multipart support
  if (body.parts && body.uploadId && body.key) {
    // body.parts: [{ partNumber, chunkSize }]
    const urls = await Promise.all(
      body.parts.map(async (part) => {
        const command = new UploadPartCommand({
          Bucket: BUCKET,
          Key: body.key,
          PartNumber: part.partNumber,
          UploadId: body.uploadId,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
        return url;
      })
    );
    console.debug('[S3-SIGNED-URL][POST] Multipart URLs:', urls);
    return new Response(JSON.stringify({ urls }), { status: 200 });
  }

  // Single-part fallback (for direct uploads)
  const { filename, type } = body;
  const key = `users/${session.user.id}/${filename}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: type,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
  console.debug('[S3-SIGNED-URL][POST] Single-part URL:', url);
  return new Response(
    JSON.stringify({ url, method: 'PUT', fields: {}, key }),
    { status: 200 }
  );
} 