import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MediaGrid from '@/components/MediaGrid';
import Navbar from '@/components/ui/navbar';

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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-base">
      <Navbar handleLogout={()=>handleLogout()} />
      {/* Navbar is rendered globally in _app.js, so do not render here */}
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-2">
          <div className="text-xl font-bold text-gray-800 dark:text-gray-100">Welcome{user ? `, ${user.email}` : ''}!</div>
        </div>
        <MediaGrid />
      </div>
    </div>
  );
}
