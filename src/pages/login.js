import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.replace('/');
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      setMessage('Login successful!');
      setTimeout(() => router.replace('/'), 1000);
    } else {
      setMessage(data.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 px-2">
      <Card className="w-full max-w-md animate-fade-in-up shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-col items-center gap-2">
          {/* Logo/Brand Placeholder */}
          <div className="mb-2 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary text-2xl font-bold">
            {/* Replace with your logo if available */}
            EH
          </div>
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
          <CardDescription className="text-center">Welcome back! Please enter your credentials to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="mb-1 block">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password" className="mb-1 block">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pr-10" placeholder="••••••••" />
                <button type="button" tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m2.062 2.675A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10 0 1.657-.336 3.236-.938 4.675m-2.062-2.675A9.956 9.956 0 0112 19c-1.657 0-3.236-.336-4.675-.938" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? 'Logging in...' : 'Login'}</Button>
          </form>
          {message && <div className={`mt-4 text-center text-sm ${message.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{message}</div>}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account? <Link href="/signup" className="underline">Sign up</Link>
          </div>
        </CardFooter>
      </Card>
      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.7s cubic-bezier(.39,.575,.565,1) both; }
      `}</style>
    </div>
  );
} 