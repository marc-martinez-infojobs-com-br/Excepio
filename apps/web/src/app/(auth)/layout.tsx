import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ThemeLogo } from '@/components/theme/theme-logo';
import { LanguageSelector } from '@/components/language-selector';
import { useTranslations } from 'next-intl';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('layout');
  
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent selection:text-accent-foreground">
      {/* Theme Toggle Header */}
      <header className="w-full flex justify-end gap-2 p-4">
        <LanguageSelector />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[440px] mx-auto px-4">
        {/* Logo and Branding Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ThemeLogo width={56} height={56} />
            <h1 className="text-4xl font-bold text-primary tracking-tight">{t('appName')}</h1>
          </div>
          <p className="text-[11px] uppercase text-muted-foreground tracking-widest opacity-80 font-semibold">
            {t('appVersion')}
          </p>
        </div>

        {children}

        {/* Footer Help */}
        <footer className="mt-8 mb-6 flex justify-center gap-6">
          <a href="#" className="text-[11px] uppercase text-muted-foreground hover:text-primary transition-colors tracking-wider font-semibold">
            {t('footer.status')}
          </a>
          <a href="#" className="text-[11px] uppercase text-muted-foreground hover:text-primary transition-colors tracking-wider font-semibold">
            {t('footer.support')}
          </a>
          <a href="#" className="text-[11px] uppercase text-muted-foreground hover:text-primary transition-colors tracking-wider font-semibold">
            {t('footer.docs')}
          </a>
        </footer>
      </main>
    </div>
  );
}
