'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@hooks/use-auth';
import { Button } from '@components/ui/button';
import { ThemeToggle } from '@components/theme/theme-toggle';
import { ThemeLogo } from '@components/theme/theme-logo';
import { ThemeAvatar } from '@components/theme/theme-avatar';
import { LanguageSelector } from '@components/language-selector';
import { WebNav } from '@components/navigation/web-nav';
import { MobileNav } from '@components/navigation/mobile-nav';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('auth');
  const tLayout = useTranslations('layout');
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <ThemeLogo width={32} height={32} />
              <span className="text-2xl font-bold text-primary tracking-tight">{tLayout('appName')}</span>
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
                  title={t('logout')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">{t('logout')}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Navigation - Solo en móvil */}
      <MobileNav />
    </div>
  );
}
