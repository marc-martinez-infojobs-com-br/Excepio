'use client';

import { useTranslations } from 'next-intl';

interface ExceptionMetadataProps {
  metadata: Record<string, unknown> | null | undefined;
}

export function ExceptionMetadata({ metadata }: ExceptionMetadataProps) {
  const t = useTranslations('exceptions.detail');

  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t('sections.metadata')}
      </h2>

      {hasMetadata ? (
        <pre className="bg-zinc-900 dark:bg-zinc-800 text-zinc-100 font-mono text-sm p-4 rounded-lg overflow-x-auto border border-transparent dark:border-input">
          <code role="code">{JSON.stringify(metadata, null, 2)}</code>
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          {t('fields.noMetadata')}
        </p>
      )}
    </div>
  );
}
