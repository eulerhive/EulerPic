import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fs from 'fs';

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

function isImage(filename) {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
}
function isVideo(filename) {
  return /\.(mp4|mov)$/i.test(filename);
}
function getThumbKey(key) {
  const parts = key.split("/");
  const filename = parts.pop();
  return [...parts, "thumbnails", filename].join("/");
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
  }
  const filename = file.name;
  const userId = session.user.id;
  const key = `users/${userId}/${filename}`;
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  // Upload original file
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: file.type,
  }));

  let thumbKey = null;
  if (isImage(filename)) {
    const thumbBuffer = await sharp(fileBuffer)
      .rotate()
      .resize(400, 400, { fit: 'inside' })
      .toBuffer();
    thumbKey = `users/${userId}/thumbnails/${filename}`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: file.type,
    }));
  }
  return new Response(JSON.stringify({ key, thumbKey }), { status: 200 });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const { key } = await req.json();
  if (!key) {
    return new Response(JSON.stringify({ error: "Missing key" }), { status: 400 });
  }
  try {
    // Delete original file
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    // If image, also delete thumbnail
    if (isImage(key)) {
      const thumbKey = getThumbKey(key);
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: thumbKey }));
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
} 