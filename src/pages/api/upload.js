import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { getPresignedUploadUrl, getS3Key, deleteFromS3 } from '@/lib/s3';
import withAuth from '@/lib/withAuth';

const prisma = new PrismaClient();

export default withAuth(async function handler(req, res) {
  if (req.method === 'DELETE') {
    // Remove media entry and S3 object(s) on cancel/failure
    const userId = req.user.userId;
    const { filename, type = 'originals' } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Missing filename' });
    }
    const s3Key = getS3Key(userId, filename, type);
    try {
      // Remove from DB
      await prisma.media.deleteMany({ where: { userId, filename } });
      // Remove from S3 (original)
      await deleteFromS3(s3Key);
      // Remove thumbnail if exists
      const thumbKey = getS3Key(userId, filename, 'thumbnails');
      await deleteFromS3(thumbKey).catch(() => {}); // ignore if not present
      return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.userId;
  const { filename, mimeType, size, width, height, takenAt, isImage, thumbnail } = req.body;
  if (!filename || !mimeType || !size) {
    return res.status(400).json({ error: 'Missing file metadata' });
  }

  // Retry logic for presigned URL generation
  let uploadUrl;
  let attempts = 0;
  while (attempts < 3) {
    try {
      uploadUrl = await getPresignedUploadUrl({ userId, filename, mimeType, type: 'originals' });
      break;
    } catch (err) {
      attempts++;
      if (attempts >= 3) {
        return res.status(500).json({ error: 'Failed to generate upload URL' });
      }
      await new Promise(r => setTimeout(r, 2 ** attempts * 100)); // Exponential backoff
    }
  }

  // If image and thumbnail provided, generate thumbnail upload URL
  let thumbnailUrl = null;
  let thumbnailKey = null;
  if (isImage && thumbnail) {
    thumbnailKey = getS3Key(userId, filename, 'thumbnails');
    try {
      thumbnailUrl = await getPresignedUploadUrl({ userId, filename, mimeType: 'image/jpeg', type: 'thumbnails' });
    } catch (err) {
      // Ignore thumbnail upload URL failure
    }
  }

  // Save metadata to Prisma (record is created after upload is confirmed in a real system, but for demo, we save now)
  try {
    await prisma.media.create({
      data: {
        userId,
        filename,
        s3Key: getS3Key(userId, filename, 'originals'),
        mimeType,
        size,
        width: width || null,
        height: height || null,
        takenAt: takenAt ? new Date(takenAt) : null,
        thumbnailKey,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save metadata' });
  }

  return res.status(200).json({ uploadUrl, thumbnailUrl, thumbnailKey });
}); 