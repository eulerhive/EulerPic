import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        router.replace('/login');
      }
      setLoading(false);
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  if (loading) return null;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome{user ? `, ${user.email}` : ''}!</h2>
        <Button onClick={handleLogout} className="mt-4">Logout</Button>
      </Card>
    </div>
  );
}
