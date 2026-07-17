'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { CopyButton } from '@components/ui/copy-button';

interface ExceptionMetadataProps {
  metadata: Record<string, unknown> | null | undefined;
}

export function ExceptionMetadata({ metadata }: ExceptionMetadataProps) {
  const t = useTranslations('exceptions.detail');
  const { resolvedTheme } = useTheme();

  const hasMetadata = metadata && Object.keys(metadata).length > 0;
  const metadataJson = hasMetadata ? JSON.stringify(metadata, null, 2) : '';

  const preClass = resolvedTheme === 'dark'
    ? 'bg-zinc-800 text-zinc-100 border-input'
    : 'bg-zinc-100 text-zinc-800 border-input';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t('sections.metadata')}
      </h2>

      {hasMetadata ? (
        <div className="relative">
          <pre className={`${preClass} font-mono text-sm p-4 rounded-lg overflow-x-auto border`}>
            <code role="code">{metadataJson}</code>
          </pre>
          <CopyButton 
            text={metadataJson} 
            label={t('actions.copy')}
            className="absolute top-2 right-2"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          {t('fields.noMetadata')}
        </p>
      )}
    </div>
  );
}
