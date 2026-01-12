'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from 'lucide-react';

const navLink = 'text-sm sm:text-sm px-2 sm:px-3 py-2 text-neutral-300 hover:text-white transition';
const menuItem = 'block px-4 py-2 text-sm text-white hover:bg-white/10';

const Dropdown = ({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) => (
  <Menu as="div" className="relative inline-block text-left">
    <Menu.Button>
      <span className="flex items-center gap-1 text-sm text-neutral-300 hover:text-white transition">
        {label}
        <ChevronDownIcon className="h-4 w-4" />
      </span>
    </Menu.Button>
    <Menu.Items>
      <div className="absolute left-0 sm:right-0 mt-2 min-w-max max-w-[calc(100vw-2rem)] rounded-md bg-black/50 backdrop-blur-md shadow-lg ring-1 ring-white/10 focus:outline-none z-50">
        {items.map(({ label, href }) => (
          <Menu.Item key={href}>
            <Link href={href} className={menuItem}>
              {label}
            </Link>
          </Menu.Item>
        ))}
      </div>
    </Menu.Items>
  </Menu>
);


const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-xl transition-all duration-200 ease-out px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2" aria-label="Yamalverse Home">
          <Image
            src="/yamal-logo.png"
            alt="Yamal Logo"
            width={42}
            height={42}
            className="rounded-full"
          />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4 gap-y-2 text-sm">
          <Link
            href="/"
            className={`${navLink} ${pathname === '/' ? 'text-white font-semibold underline underline-offset-4' : ''}`}
          >
            Home
          </Link>

          <Dropdown
            label="Career"
            items={[
              { label: 'Club Stats', href: '/club' },
              { label: 'International', href: '/international' },
              { label: 'Per 90', href: '/per90' },
              { label: 'Progression', href: '/progression' },
              { label: 'Dribbles', href: '/dribbles' },
              { label: 'Opponents', href: '/opponents' },
            ]}
          />

          <Dropdown
            label="Achievements"
            items={[
              { label: 'Honours', href: '/honours' },
              { label: 'Records', href: '/records' },
            ]}
          />

          <Dropdown
            label="About"
            items={[
              { label: 'FAQs', href: '/faqs' },
              { label: 'Support', href: '/support' },
              { label: 'Feedback', href: '/feedback' },
            ]}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
