import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bars3Icon, HomeIcon, ArrowRightOnRectangleIcon, UserPlusIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

export default function Navbar({ handleLogout }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link href="/" aria-label="Home" title="Home" className="flex items-center justify-center"><HomeIcon className="w-6 h-6" /></Link>
      <Link href="/login" aria-label="Login" title="Login" className="flex items-center justify-center"><ArrowRightOnRectangleIcon className="w-6 h-6" /></Link>
      <Link href="/signup" aria-label="Sign Up" title="Sign Up" className="flex items-center justify-center"><UserPlusIcon className="w-6 h-6" /></Link>
      <Button onClick={handleLogout} aria-label="Logout" title="Logout" variant="ghost" icon={<ArrowLeftOnRectangleIcon className="w-6 h-6" />} />
    </>
  );

  return (
    <nav className="sticky top-0 z-20 w-full bg-gray-900">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <Link href="/" aria-label="EulerPic Home" className="font-bold text-xl tracking-tight text-white">EulerPic</Link>
        <div className="hidden md:flex gap-2 items-center">{navLinks}</div>
        <button
          className="md:hidden flex items-center"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          title="Menu"
        >
          <Bars3Icon className="w-7 h-7 text-white" />
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-1 px-2 pb-4">{navLinks}</div>
      )}
    </nav>
  );
} 