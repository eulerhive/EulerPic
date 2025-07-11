import { verify } from 'jsonwebtoken';

export default function withAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
} 