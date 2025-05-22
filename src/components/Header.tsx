'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md">
      <nav className="flex items-center justify-center max-w-6xl mx-auto p-6">
        <Link
          href="/"
          className="text-blue-800 text-3xl font-extrabold tracking-tight text-center"
        >
          LOGO
        </Link>
      </nav>
    </header>
  );
}