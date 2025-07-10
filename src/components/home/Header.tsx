'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md">
      <nav className="flex items-center justify-center max-w-6xl mx-auto p-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/imovion.png"
            alt="Imovion Logo"
            width={900}
            height={10}
            priority
            className="h-9 sm:h-11 w-auto"
          />
        </Link>
      </nav>
    </header>
  );
}