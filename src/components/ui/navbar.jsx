import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Navbar({ handleLogout }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link href="/" className={`block px-4 py-2 rounded text-base ${router.pathname === '/' ? 'font-bold underline' : 'text-gray-300 hover:text-white hover:underline'}`}>Home</Link>
      <Link href="/login" className={`block px-4 py-2 rounded text-base ${router.pathname === '/login' ? 'font-bold underline' : 'text-gray-300 hover:text-white hover:underline'}`}>Login</Link>
      <Link href="/signup" className={`block px-4 py-2 rounded text-base ${router.pathname === '/signup' ? 'font-bold underline' : 'text-gray-300 hover:text-white hover:underline'}`}>Sign Up</Link>
      <Button onClick={handleLogout} className="w-full mt-2" variant="default">Logout</Button>
    </>
  );

  return (
    <nav className="sticky top-0 z-20 w-full bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-xl tracking-tight text-white">EulerPic</Link>
        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 items-center">
          <Link href="/" className={`text-base ${router.pathname === '/' ? 'font-bold underline' : 'text-gray-300 hover:text-white hover:underline'}`}>Home</Link>
          <Link href="/login" className={`text-base ${router.pathname === '/login' ? 'font-bold underline' : 'text-gray-300 hover:text-white hover:underline'}`}>Login</Link>
          <Link href="/signup" className={`text-base ${router.pathname === '/signup' ? 'font-bold underline' : 'text-gray-300 hover:text-white hover:underline'}`}>Sign Up</Link>
          <Button onClick={handleLogout} className="ml-2" variant="default">Logout</Button>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center p-2 text-gray-300 hover:text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-2 pb-4 animate-fade-in flex flex-col gap-1">
          {navLinks}
        </div>
      )}
    </nav>
  );
} 