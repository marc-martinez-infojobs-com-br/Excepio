import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Card className="w-full border border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Bienvenido</CardTitle>
        <CardDescription>
          Accede a tu panel de monitoreo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        
        {/* Secondary Sign In */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
