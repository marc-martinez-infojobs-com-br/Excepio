'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { Button } from '@components/ui/button';
import { ThemeToggle } from '@components/theme/theme-toggle';
import { ThemeLogo } from '@components/theme/theme-logo';
import { ThemeAvatar } from '@components/theme/theme-avatar';
import { LanguageSelector } from '@components/language-selector';
import { WebNav } from '@components/navigation/web-nav';
import { MobileNav } from '@components/navigation/mobile-nav';
import { LostAstronautIllustration } from '@components/illustrations/lost-astronaut';
import { useAuth } from '@hooks/use-auth';

export default function NotFound() {
  const t = useTranslations('notFound');
  const tAuth = useTranslations('auth');
  const tLayout = useTranslations('layout');
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <ThemeLogo width={32} height={32} />
              <span className="text-2xl font-bold text-primary tracking-tight">
                {tLayout('appName')}
              </span>
            </div>

            {/* Navigation - Solo en desktop */}
            <div className="hidden md:block">
              <WebNav />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />

            {user && (
              <>
                <ThemeAvatar name={user.name} className="h-8 w-8 cursor-pointer" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title={tAuth('logout')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">{tAuth('logout')}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content - Centered */}
      <main className="flex-1 flex items-center justify-center pb-20 md:pb-0">
        <div className="flex flex-col items-center text-center px-4">
          <LostAstronautIllustration className="w-72 h-72 text-primary mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            {t('description')}
          </p>
          <Button asChild>
            <Link href="/dashboard">{t('backHome')}</Link>
          </Button>
        </div>
      </main>

      {/* Mobile Navigation - Solo en móvil */}
      <MobileNav />
    </div>
  );
}
