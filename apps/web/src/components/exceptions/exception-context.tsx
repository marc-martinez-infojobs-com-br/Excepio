'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { PlatformIcon } from '@components/platforms/platform-icon';
import type { ExceptionDetailDto } from '@excepio/shared';

interface ExceptionContextProps {
  exception: ExceptionDetailDto;
}

interface ContextRowProps {
  label: string;
  value: string | number | null | undefined;
  notAvailableText: string;
}

function ContextRow({ label, value, notAvailableText }: ContextRowProps) {
  const displayValue = value !== null && value !== undefined && value !== '' 
    ? String(value) 
    : notAvailableText;
  
  const isNotAvailable = displayValue === notAvailableText;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-input last:border-b-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className={`text-sm ${isNotAvailable ? 'text-muted-foreground italic' : 'text-foreground'}`}>
        {displayValue}
      </span>
    </div>
  );
}

function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function ExceptionContext({ exception }: ExceptionContextProps) {
  const t = useTranslations('exceptions.detail');
  const { resolvedTheme } = useTheme();
  const notAvailable = t('fields.notAvailable');

  const containerClass = resolvedTheme === 'dark' 
    ? 'border border-input rounded-lg p-4 space-y-1 bg-zinc-800'
    : 'border border-input rounded-lg p-4 space-y-1';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t('sections.context')}
      </h2>

      <div className={containerClass}>
        {/* Platform */}
        <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-input">
          <span className="text-sm font-medium text-muted-foreground">{t('fields.platform')}</span>
          <span className="text-sm text-foreground flex items-center gap-2">
            <PlatformIcon iconName={exception.platformIcon} className="h-4 w-4" />
            {exception.platformName || notAvailable}
          </span>
        </div>

        {/* Version */}
        <ContextRow 
          label={t('fields.appVersion')} 
          value={exception.appVersion} 
          notAvailableText={notAvailable} 
        />

        {/* URL */}
        <ContextRow 
          label={t('fields.url')} 
          value={exception.url} 
          notAvailableText={notAvailable} 
        />

        {/* User */}
        <ContextRow 
          label={t('fields.userId')} 
          value={exception.userId} 
          notAvailableText={notAvailable} 
        />

        {/* Timestamp */}
        <ContextRow 
          label={t('fields.timestamp')} 
          value={formatDateTime(exception.createdAt)} 
          notAvailableText={notAvailable} 
        />

        {/* Affected Users */}
        <ContextRow 
          label={t('fields.affectedUsers')} 
          value={exception.affectedUsersCount} 
          notAvailableText={notAvailable} 
        />
      </div>
    </div>
  );
}
