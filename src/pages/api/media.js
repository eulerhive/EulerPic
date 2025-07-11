import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import withAuth from '@/lib/withAuth';

const prisma = new PrismaClient();

export default withAuth(async function handler(req, res) {
  // Sorting
  const sort = req.query.sort === 'takenAt' ? 'takenAt' : 'createdAt';
  let orderBy = {};
  orderBy[sort] = 'desc';

  const userId = req.user.userId;
  try {
    const media = await prisma.media.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy,
      select: {
        id: true,
        filename: true,
        s3Key: true,
        thumbnailKey: true,
        mimeType: true,
        takenAt: true,
        createdAt: true,
      },
    });
    return res.status(200).json({ media });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch media' });
  }
}); 