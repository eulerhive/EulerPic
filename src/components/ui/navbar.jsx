import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from './button';

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="sticky top-0 z-20 w-full bg-white/80 dark:bg-gray-900/80 shadow-sm backdrop-blur border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-xl tracking-tight text-primary">
          EulerPic
        </Link>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant={router.pathname === '/' ? 'default' : 'outline'} size="sm">Home</Button>
          </Link>
          <Link href="/login">
            <Button variant={router.pathname === '/login' ? 'default' : 'outline'} size="sm">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant={router.pathname === '/signup' ? 'default' : 'outline'} size="sm">Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
} 