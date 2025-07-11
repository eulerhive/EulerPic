import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken'; // if using JWT
import withAuth from '@/lib/withAuth';

const prisma = new PrismaClient();

export default withAuth(async function handler(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  return res.status(200).json({ user: { id: user.id, email: user.email } });
});