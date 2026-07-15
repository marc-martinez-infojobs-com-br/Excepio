import { LoginForm } from '@components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  
  return (
    <Card className="w-full border border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">{t('title')}</CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        
        {/* Secondary Sign In */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
