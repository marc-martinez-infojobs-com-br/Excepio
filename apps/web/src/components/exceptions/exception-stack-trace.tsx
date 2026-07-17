'use client';

import { useTranslations } from 'next-intl';

interface ExceptionStackTraceProps {
  stackTrace: string | null | undefined;
}

export function ExceptionStackTrace({ stackTrace }: ExceptionStackTraceProps) {
  const t = useTranslations('exceptions.detail');

  const hasStackTrace = stackTrace && stackTrace.trim().length > 0;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t('sections.stackTrace')}
      </h2>

      {hasStackTrace ? (
        <pre className="bg-zinc-900 text-zinc-100 font-mono text-sm p-4 rounded-lg overflow-x-auto">
          <code role="code">{stackTrace}</code>
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          {t('fields.noStackTrace')}
        </p>
      )}
    </div>
  );
}
