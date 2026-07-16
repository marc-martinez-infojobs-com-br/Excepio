'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { PlatformIcon } from '@components/platforms/platform-icon';
import { Copy, Check, Eye, EyeOff, Pencil, Trash2, RefreshCw, RotateCcw } from 'lucide-react';
import type { PlatformDto } from '@excepio/shared';

interface PlatformCardProps {
  platform: PlatformDto;
  onEdit: (platform: PlatformDto) => void;
  onDelete: (platform: PlatformDto) => void;
  onRegenerateKey: (platform: PlatformDto) => void;
  onActivate: (platform: PlatformDto) => void;
}

function StatusBadge({ statusId }: { statusId: number }) {
  const t = useTranslations('platforms.status');

  const statusConfig: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    1: { label: t('pending'), variant: 'secondary' },
    2: { label: t('active'), variant: 'default' },
    3: { label: t('expired'), variant: 'outline' },
    4: { label: t('deleted'), variant: 'destructive' },
  };

  const config = statusConfig[statusId] || { label: 'Unknown', variant: 'outline' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PlatformCard({
  platform,
  onEdit,
  onDelete,
  onRegenerateKey,
  onActivate,
}: PlatformCardProps) {
  const t = useTranslations('platforms');
  const tApiKey = useTranslations('platforms.apiKey');
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isDeleted = platform.statusId === 4;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(platform.apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const maskedKey = `${platform.apiKey.slice(0, 8)}${'•'.repeat(24)}${platform.apiKey.slice(-4)}`;

  return (
    <div className="border border-input rounded-lg p-3 bg-card">
      {/* Header: Icon + Name + Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PlatformIcon
            iconName={platform.icon}
            className="text-muted-foreground"
          />
          <span className="font-semibold text-base">{platform.name}</span>
        </div>
        <StatusBadge statusId={platform.statusId} />
      </div>

      {/* API Key Section */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
            {isVisible ? platform.apiKey : maskedKey}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="h-7 w-7 p-0 flex-shrink-0"
            aria-label={isVisible ? tApiKey('hide') : tApiKey('show')}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 p-0 flex-shrink-0"
            aria-label={isCopied ? tApiKey('copied') : tApiKey('copy')}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Created Date */}
      <div className="text-xs text-muted-foreground mb-3 text-right">
        {t('table.createdAt')}: {new Date(platform.createdAt).toLocaleDateString()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        {!isDeleted ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerateKey(platform)}
              className="flex-1 gap-1"
              aria-label={tApiKey('regenerate')}
            >
              <RefreshCw className="h-4 w-4" />
              {tApiKey('regenerate')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(platform)}
              className="flex-1 gap-1"
              aria-label={t('edit.button')}
            >
              <Pencil className="h-4 w-4" />
              {t('edit.button')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(platform)}
              className="h-9 w-9 p-0 text-destructive hover:text-destructive"
              aria-label={t('delete.button')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onActivate(platform)}
            className="w-full gap-1 text-green-600 hover:text-green-600"
            aria-label={t('activate.button')}
          >
            <RotateCcw className="h-4 w-4" />
            {t('activate.button')}
          </Button>
        )}
      </div>
    </div>
  );
}
