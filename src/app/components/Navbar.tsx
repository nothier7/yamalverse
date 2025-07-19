'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'All Time', href: '/' },
  { label: 'Club Stats', href: '/club' },
  { label: 'International', href: '/international' },
  { label: 'Honours', href: '/honours' },
  { label: 'Records', href: '/records' },
  { label: 'FAQs', href: '/faqs' },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-xl transition-all duration-200 ease-out px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        <Link href="/" className="flex items-center gap-2" aria-label="Yamalverse Home">
          <Image
            src="/yamal-logo.png"
            alt="Yamal Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-neutral-200">
          {navItems.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`hover:text-gray-400 ${
                  pathname === href ? 'text-white font-semibold underline underline-offset-4' : ''
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
