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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { AlertCircle } from 'lucide-react';
import type { UserResponseDto } from '@excepio/shared';
import { UserRole } from '@excepio/shared';
import { PasswordStrength } from '@components/auth/password-strength';

// Schema para el formulario
type FormData = {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
};

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserResponseDto | null;
  onSubmit: (data: FormData, isEdit: boolean) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSubmit,
  isSubmitting,
  error,
}: UserFormModalProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common.buttons');
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError: setFormError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.USUARIO,
    },
  });

  const roleValue = watch('role');
  const passwordValue = watch('password');

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          password: '',
          confirmPassword: '',
          role: user.role,
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: UserRole.USUARIO,
        });
      }
    }
  }, [open, user, reset]);

  const handleFormSubmit = async (data: FormData) => {
    // Validación de contraseñas coincidentes (solo al crear)
    if (!isEdit && data.password !== data.confirmPassword) {
      setFormError('confirmPassword', {
        type: 'manual',
        message: t('form.passwordMismatch'),
      });
      return;
    }
    
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

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              placeholder={t('form.namePlaceholder')}
              {...register('name', { required: true })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('form.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('form.emailPlaceholder')}
              {...register('email', { required: true })}
              disabled={isEdit}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password (solo para crear) */}
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">{t('form.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('form.passwordPlaceholder')}
                  {...register('password', { required: !isEdit })}
                />
                <p className="text-xs text-muted-foreground">
                  {t('form.passwordHelp')}
                </p>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
                <PasswordStrength password={passwordValue || ''} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('form.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('form.confirmPasswordPlaceholder')}
                  {...register('confirmPassword', { required: !isEdit })}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </>
          )}

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="role">{t('form.role')}</Label>
            <Select
              value={roleValue}
              onValueChange={(value) => setValue('role', value as UserRole)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder={t('form.rolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.USUARIO}>
                  {t('roles.USUARIO')}
                </SelectItem>
                <SelectItem value={UserRole.ADMINISTRADOR}>
                  {t('roles.ADMINISTRADOR')}
                </SelectItem>
              </SelectContent>
            </Select>
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
