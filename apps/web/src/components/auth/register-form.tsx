'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterBaseSchema, type RegisterDto } from '@excepio/shared';
import { useAuth } from '@hooks/use-auth';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { useState } from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { PasswordStrength } from './password-strength';
import { useTranslations } from 'next-intl';

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterDto>({
    resolver: zodResolver(RegisterBaseSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Watch password for strength indicator and confirmPassword validation
  const watchedPassword = form.watch('password');
  const watchedConfirmPassword = form.watch('confirmPassword');

  const onSubmit = async (data: RegisterDto) => {
    try {
      setError(null);
      
      // Validación manual de contraseñas coincidentes
      // (workaround para bug en @hookform/resolvers con Zod v4 refine)
      if (data.password !== data.confirmPassword) {
        form.setError('confirmPassword', {
          type: 'manual',
          message: t('passwordMismatch'),
        });
        return;
      }
      
      await register(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[11px] uppercase text-muted-foreground tracking-wider font-semibold">
                {t('name')}
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    className="pl-10 py-[10px] border-border bg-card focus:border-primary"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[11px] uppercase text-muted-foreground tracking-wider font-semibold">
                {t('email')}
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="pl-10 py-[10px] border-border bg-card focus:border-primary"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[11px] uppercase text-muted-foreground tracking-wider font-semibold">
                {t('password')}
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 py-[10px] border-border bg-card focus:border-primary"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
              <PasswordStrength password={watchedPassword} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[11px] uppercase text-muted-foreground tracking-wider font-semibold">
                {t('confirmPassword')}
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 py-[10px] border-border bg-card focus:border-primary"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 mt-6 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          disabled={form.formState.isSubmitting}
        >
          <span>{form.formState.isSubmitting ? t('submitting') : t('submit')}</span>
          {!form.formState.isSubmitting && <ArrowRight className="h-[18px] w-[18px]" />}
        </Button>
      </form>
    </Form>
  );
}
