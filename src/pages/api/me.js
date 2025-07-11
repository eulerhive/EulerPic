import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken'; // if using JWT

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // If using JWT:
    const decoded = verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    return res.status(200).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}