import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Excepio</h1>
            <p className="text-muted-foreground mt-2">
              Sistema de Registro de Excepciones
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
