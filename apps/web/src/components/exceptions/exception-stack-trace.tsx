'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { CopyButton } from '@components/ui/copy-button';

interface ExceptionStackTraceProps {
  stackTrace: string | null | undefined;
}

export function ExceptionStackTrace({ stackTrace }: ExceptionStackTraceProps) {
  const t = useTranslations('exceptions.detail');
  const { resolvedTheme } = useTheme();

  const hasStackTrace = stackTrace && stackTrace.trim().length > 0;

  const preClass = resolvedTheme === 'dark'
    ? 'bg-zinc-800 text-zinc-100 border-input'
    : 'bg-zinc-100 text-zinc-800 border-input';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t('sections.stackTrace')}
      </h2>

      {hasStackTrace ? (
        <div className="relative">
          <pre className={`${preClass} font-mono text-sm p-4 rounded-lg overflow-x-auto border`}>
            <code role="code">{stackTrace}</code>
          </pre>
          <CopyButton 
            text={stackTrace} 
            label={t('actions.copy')}
            className="absolute top-2 right-2"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          {t('fields.noStackTrace')}
        </p>
      )}
    </div>
  );
}
