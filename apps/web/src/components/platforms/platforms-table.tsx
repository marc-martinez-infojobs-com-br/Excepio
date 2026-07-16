'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { PlatformIcon } from '@components/platforms/platform-icon';
import { Copy, Check, Eye, EyeOff, Pencil, Trash2, RefreshCw, RotateCcw } from 'lucide-react';
import type { PlatformDto } from '@excepio/shared';

interface PlatformsTableProps {
  platforms: PlatformDto[];
  onEdit: (platform: PlatformDto) => void;
  onDelete: (platform: PlatformDto) => void;
  onRegenerateKey: (platform: PlatformDto) => void;
  onActivate: (platform: PlatformDto) => void;
}

function ApiKeyCell({ apiKey }: { apiKey: string }) {
  const t = useTranslations('platforms');
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const maskedKey = `${apiKey.slice(0, 8)}${'•'.repeat(24)}${apiKey.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
        {isVisible ? apiKey : maskedKey}
      </code>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="h-7 w-7 p-0"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isVisible ? t('apiKey.hide') : t('apiKey.show')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 w-7 p-0"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isCopied ? t('apiKey.copied') : t('apiKey.copy')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
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

export function PlatformsTable({
  platforms,
  onEdit,
  onDelete,
  onRegenerateKey,
  onActivate,
}: PlatformsTableProps) {
  const t = useTranslations('platforms');

  const isDeleted = (platform: PlatformDto) => platform.statusId === 4;

  return (
    <div className="border border-input rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.id')}
            </TableHead>
            <TableHead className="w-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.icon')}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.name')}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.apiKey')}
            </TableHead>
            <TableHead className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.status')}
            </TableHead>
            <TableHead className="w-32 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.createdAt')}
            </TableHead>
            <TableHead className="w-32 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {platforms.map((platform) => (
            <TableRow key={platform.id} className="border-b border-border">
              <TableCell className="font-medium py-4">{platform.id}</TableCell>
              <TableCell className="py-4">
                <PlatformIcon
                  iconName={platform.icon}
                  className="text-muted-foreground"
                />
              </TableCell>
              <TableCell className="font-medium py-4">{platform.name}</TableCell>
              <TableCell className="py-4">
                <ApiKeyCell apiKey={platform.apiKey} />
              </TableCell>
              <TableCell className="py-4">
                <StatusBadge statusId={platform.statusId} />
              </TableCell>
              <TableCell className="text-muted-foreground py-4">
                {new Date(platform.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center justify-end gap-1">
                  {!isDeleted(platform) && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRegenerateKey(platform)}
                              className="h-8 w-8 p-0"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('apiKey.regenerate')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(platform)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('edit.button')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(platform)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('delete.button')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                  {isDeleted(platform) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onActivate(platform)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-600"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('activate.button')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
