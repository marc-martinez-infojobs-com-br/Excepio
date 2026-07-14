'use client';

import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a Excepio</h1>
      {user && (
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Usuario: <span className="font-medium text-foreground">{user.name}</span>
          </p>
          <p className="text-muted-foreground">
            Email: <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <p className="text-muted-foreground">
            Rol: <span className="font-medium text-foreground">{user.role}</span>
          </p>
        </div>
      )}
      <p className="text-muted-foreground mt-8">
        Dashboard en construcción...
      </p>
    </div>
  );
}
