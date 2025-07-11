import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const cookie = serialize('session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ message: 'Logged out' });
} 