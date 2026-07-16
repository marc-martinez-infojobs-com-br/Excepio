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

interface DeletePlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PlatformDto | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export function DeletePlatformDialog({
  open,
  onOpenChange,
  platform,
  onConfirm,
  isDeleting,
}: DeletePlatformDialogProps) {
  const t = useTranslations('platforms');
  const tCommon = useTranslations('common.buttons');

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>
            {t('delete.confirm', { name: platform?.name || '' })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t('form.submitting') : t('delete.button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
