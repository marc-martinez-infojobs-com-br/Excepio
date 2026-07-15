'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/i18n/config';

const LOCALE_COOKIE = 'NEXT_LOCALE';

const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  ca: 'Català',
};

// Componentes SVG de bolas con colores de bandera
function CatalanFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#FCDD09" />
      <rect x="5" y="2" width="2" height="20" fill="#DA121A" rx="1" />
      <rect x="9" y="2" width="2" height="20" fill="#DA121A" rx="1" />
      <rect x="13" y="2" width="2" height="20" fill="#DA121A" rx="1" />
      <rect x="17" y="2" width="2" height="20" fill="#DA121A" rx="1" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#FCDD09" strokeWidth="0.5" />
      <clipPath id="catalanClip">
        <circle cx="12" cy="12" r="10" />
      </clipPath>
      <g clipPath="url(#catalanClip)">
        <rect x="4" y="0" width="2" height="24" fill="#DA121A" />
        <rect x="8" y="0" width="2" height="24" fill="#DA121A" />
        <rect x="12" y="0" width="2" height="24" fill="#DA121A" />
        <rect x="16" y="0" width="2" height="24" fill="#DA121A" />
      </g>
    </svg>
  );
}

function SpanishFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <clipPath id="spanishClip">
        <circle cx="12" cy="12" r="10" />
      </clipPath>
      <g clipPath="url(#spanishClip)">
        <rect x="0" y="0" width="24" height="6" fill="#AA151B" />
        <rect x="0" y="6" width="24" height="12" fill="#F1BF00" />
        <rect x="0" y="18" width="24" height="6" fill="#AA151B" />
      </g>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#d4d4d4" strokeWidth="0.5" />
    </svg>
  );
}

function USFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <clipPath id="usClip">
        <circle cx="12" cy="12" r="10" />
      </clipPath>
      <g clipPath="url(#usClip)">
        <rect x="0" y="0" width="24" height="24" fill="#FFFFFF" />
        <rect x="0" y="0" width="24" height="1.85" fill="#B22234" />
        <rect x="0" y="3.7" width="24" height="1.85" fill="#B22234" />
        <rect x="0" y="7.4" width="24" height="1.85" fill="#B22234" />
        <rect x="0" y="11.1" width="24" height="1.85" fill="#B22234" />
        <rect x="0" y="14.8" width="24" height="1.85" fill="#B22234" />
        <rect x="0" y="18.5" width="24" height="1.85" fill="#B22234" />
        <rect x="0" y="22.2" width="24" height="1.85" fill="#B22234" />
        <rect x="0" y="0" width="9.6" height="13" fill="#3C3B6E" />
      </g>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#d4d4d4" strokeWidth="0.5" />
    </svg>
  );
}

const LocaleIcon: Record<Locale, React.FC<{ className?: string }>> = {
  ca: CatalanFlag,
  es: SpanishFlag,
  en: USFlag,
};

export function LanguageSelector() {
  const t = useTranslations('layout');
  const currentLocale = useLocale() as Locale;

  const handleLocaleChange = (newLocale: Locale) => {
    // Guardar en cookie
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=31536000`; // 1 año
    // Recargar la página para aplicar el nuevo idioma
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={t('changeLanguage')}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('changeLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => {
          const IconComponent = LocaleIcon[locale];
          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={currentLocale === locale ? 'bg-accent' : ''}
            >
              <IconComponent className="h-5 w-5 mr-2" />
              {localeNames[locale]}
              {currentLocale === locale && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
