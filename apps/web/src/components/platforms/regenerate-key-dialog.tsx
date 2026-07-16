'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import type { PlatformDto } from '@excepio/shared';

interface RegenerateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PlatformDto | null;
  onConfirm: () => Promise<void>;
  isRegenerating?: boolean;
}

export function RegenerateKeyDialog({
  open,
  onOpenChange,
  platform,
  onConfirm,
  isRegenerating,
}: RegenerateKeyDialogProps) {
  const t = useTranslations('platforms');
  const tCommon = useTranslations('common.buttons');

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('apiKey.regenerate')}</DialogTitle>
          <DialogDescription>
            {t('apiKey.regenerateConfirm')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRegenerating}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isRegenerating}
          >
            {isRegenerating ? t('form.submitting') : t('apiKey.regenerate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
