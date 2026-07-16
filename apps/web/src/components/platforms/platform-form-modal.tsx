'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { IconSelector } from '@components/platforms/icon-selector';
import { AlertCircle } from 'lucide-react';
import type { PlatformDto } from '@excepio/shared';

// Schema para el formulario
// id es opcional para edición
type FormData = {
  id?: number;
  name: string;
  icon?: string;
};

interface PlatformFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: PlatformDto | null;
  onSubmit: (data: FormData, isEdit: boolean) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

export function PlatformFormModal({
  open,
  onOpenChange,
  platform,
  onSubmit,
  isSubmitting,
  error,
}: PlatformFormModalProps) {
  const t = useTranslations('platforms');
  const tCommon = useTranslations('common.buttons');
  const isEdit = !!platform;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      id: undefined,
      name: '',
      icon: '',
    },
  });

  const iconValue = watch('icon');

  // Reset form when modal opens/closes or platform changes
  useEffect(() => {
    if (open) {
      if (platform) {
        reset({
          id: platform.id,
          name: platform.name,
          icon: platform.icon || '',
        });
      } else {
        reset({
          id: undefined,
          name: '',
          icon: '',
        });
      }
    }
  }, [open, platform, reset]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data, isEdit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('edit.title') : t('create.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ID (solo para crear) */}
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="id">{t('form.id')}</Label>
              <Input
                id="id"
                type="number"
                placeholder={t('form.idPlaceholder')}
                {...register('id', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                {t('form.idHelp')}
              </p>
              {errors.id && (
                <p className="text-xs text-destructive">{errors.id.message}</p>
              )}
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              placeholder={t('form.namePlaceholder')}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Icono */}
          <div className="space-y-2">
            <Label>{t('form.icon')}</Label>
            <IconSelector
              value={iconValue}
              onChange={(value) => setValue('icon', value)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
