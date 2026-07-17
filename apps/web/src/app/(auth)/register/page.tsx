'use client';

import { useSearchParams } from 'next/navigation';
import { RegisterForm } from '@components/auth/register-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const loginHref = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login';
  
  return (
    <Card className="w-full border border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">{t('title')}</CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        
        {/* Link a Login */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {t('hasAccount')}{' '}
            <Link href={loginHref} className="text-primary font-semibold hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
