'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Shield, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  // Obtener iniciales del usuario para el avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <div className="flex items-center gap-1">
            <div className="bg-primary p-1 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">Excepio</span>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {user && (
              <>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={logout}
                  title="Cerrar sesión"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Cerrar sesión</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  );
}
