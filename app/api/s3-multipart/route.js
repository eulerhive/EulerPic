import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, ListPartsCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';

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
  console.debug('[S3-MULTIPART][POST] Incoming request');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.debug('[S3-MULTIPART][POST] Unauthorized');
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const body = await req.json();
  console.debug('[S3-MULTIPART][POST] Body:', body);
  const { filename, type } = body;
  const key = `users/${session.user.id}/${filename}`;
  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: type,
  });
  const data = await s3.send(command);
  console.debug('[S3-MULTIPART][POST] S3 response:', data);
  console.debug('[S3-MULTIPART][POST] Returning:', { uploadId: data.UploadId, key });
  return new Response(JSON.stringify({ uploadId: data.UploadId, key }), { status: 200 });
}

export async function GET(req) {
  console.debug('[S3-MULTIPART][GET] Incoming request');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.debug('[S3-MULTIPART][GET] Unauthorized');
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const uploadId = searchParams.get('uploadId');
  console.debug('[S3-MULTIPART][GET] Params:', { key, uploadId });
  const command = new ListPartsCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
  });
  const data = await s3.send(command);
  console.debug('[S3-MULTIPART][GET] S3 response:', data);
  return new Response(JSON.stringify({ parts: data.Parts }), { status: 200 });
}

export async function PUT(req) {
  console.debug('[S3-MULTIPART][PUT] Incoming request');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.debug('[S3-MULTIPART][PUT] Unauthorized');
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const body = await req.json();
  console.debug('[S3-MULTIPART][PUT] Body:', body);
  const { key, uploadId, parts } = body;
  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });
  const data = await s3.send(command);
  console.debug('[S3-MULTIPART][PUT] S3 response:', data);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function DELETE(req) {
  console.debug('[S3-MULTIPART][DELETE] Incoming request');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.debug('[S3-MULTIPART][DELETE] Unauthorized');
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const body = await req.json();
  console.debug('[S3-MULTIPART][DELETE] Body:', body);
  const { key, uploadId } = body;
  const command = new AbortMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
  });
  const data = await s3.send(command);
  console.debug('[S3-MULTIPART][DELETE] S3 response:', data);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 