'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md">
      <nav className="flex items-center justify-center p-6">
        <Link href="/" className="text-black text-3xl font-black">
          LOGO
        </Link>
      </nav>
    </header>
  );
}
