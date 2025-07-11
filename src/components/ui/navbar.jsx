import Link from 'next/link';
import { useRouter } from 'next/router';
import {Button} from '@/components/ui/button';
export default function Navbar({handleLogout}) {
  const router = useRouter();
  return (
    <nav className="sticky top-0 z-20 bg-black w-full dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex items-center justify-between px-2 py-2">
        <Link href="/" className="font-semibold text-lg tracking-tight text-gray-900 dark:text-gray-100">
          EulerPic
        </Link>
        <div className="flex gap-4">
          <Link href="/" className={`text-sm ${router.pathname === '/' ? 'font-bold underline' : 'text-gray-600 dark:text-gray-300 hover:underline'}`}>Home</Link>
          <Link href="/login" className={`text-sm ${router.pathname === '/login' ? 'font-bold underline' : 'text-gray-600 dark:text-gray-300 hover:underline'}`}>Login</Link>
          <Link href="/signup" className={`text-sm ${router.pathname === '/signup' ? 'font-bold underline' : 'text-gray-600 dark:text-gray-300 hover:underline'}`}>Sign Up</Link>
          <Button onClick={handleLogout} className="w-full sm:w-auto" variant="default">Logout</Button>
        </div>
      </div>
    </nav>
  );
} 