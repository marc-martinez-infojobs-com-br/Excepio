'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@hooks/use-auth';
import { UserRole } from '@excepio/shared';
import { cn } from '@lib/utils';

interface NavItem {
  href: string;
  labelKey: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard' },
  { href: '/issues', labelKey: 'issues' },
  { href: '/platforms', labelKey: 'platforms', adminOnly: true },
  { href: '/users', labelKey: 'users', adminOnly: true },
];

export function MainNav() {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === UserRole.ADMINISTRADOR;

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <nav className="flex items-center space-x-6">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'text-base text-primary transition-all hover:opacity-80',
              isActive
                ? 'font-bold text-lg'
                : 'font-medium'
            )}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
