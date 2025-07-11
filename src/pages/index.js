import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import MediaGrid from '@/components/MediaGrid';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-2">
          <div className="text-xl font-bold">
            Welcome{user ? `, ${user.email}` : ''}!
          </div>
          <Button onClick={handleLogout} className="w-full sm:w-auto">Logout</Button>
        </div>
        <MediaGrid />
      </div>
    </div>
  );
}
