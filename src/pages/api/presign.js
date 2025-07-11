import { verify } from 'jsonwebtoken';
import { getPresignedDownloadUrl } from '@/lib/s3';
import withAuth from '@/lib/withAuth';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { s3Key } = req.body;
  if (!s3Key) {
    return res.status(400).json({ error: 'Missing s3Key' });
  }

  try {
    const url = await getPresignedDownloadUrl({ userId: '', filename: '', type: '', s3KeyOverride: s3Key });
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});
