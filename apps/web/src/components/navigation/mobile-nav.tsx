'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@hooks/use-auth';
import { UserRole } from '@excepio/shared';
import { cn } from '@lib/utils';
import { LayoutDashboard, AlertTriangle, Monitor, Users } from 'lucide-react';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/issues', labelKey: 'issues', icon: AlertTriangle },
  { href: '/platforms', labelKey: 'platforms', icon: Monitor, adminOnly: true },
  { href: '/users', labelKey: 'users', icon: Users, adminOnly: true },
];

export function MobileNav() {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === UserRole.ADMINISTRADOR;

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className={cn(
                'text-xs',
                isActive && 'font-semibold'
              )}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
