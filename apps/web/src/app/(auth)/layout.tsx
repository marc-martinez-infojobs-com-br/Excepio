import type { ReactNode } from 'react';
import { Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent selection:text-accent-foreground">
      {/* Theme Toggle Header */}
      <header className="w-full flex justify-end p-4">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[440px] mx-auto px-4">
        {/* Logo and Branding Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-2">
            <div className="bg-primary p-1 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">Excepio</h1>
          </div>
          <p className="text-[11px] uppercase text-muted-foreground tracking-widest opacity-80 font-semibold">
            Sistema de Excepciones v1.0
          </p>
        </div>

        {children}

        {/* Footer Help */}
        <footer className="mt-8 mb-6 flex justify-center gap-6">
          <a href="#" className="text-[11px] uppercase text-muted-foreground hover:text-primary transition-colors tracking-wider font-semibold">
            Estado
          </a>
          <a href="#" className="text-[11px] uppercase text-muted-foreground hover:text-primary transition-colors tracking-wider font-semibold">
            Soporte
          </a>
          <a href="#" className="text-[11px] uppercase text-muted-foreground hover:text-primary transition-colors tracking-wider font-semibold">
            Docs
          </a>
        </footer>
      </main>
    </div>
  );
}
