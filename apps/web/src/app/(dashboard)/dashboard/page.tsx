'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Excepio</h1>
      {user && (
        <div className="space-y-2 mb-8">
          <p className="text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{user.name}</span>
          </p>
          <p className="text-muted-foreground">
            Role: <span className="font-medium text-foreground">{user.role}</span>
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/exceptions" className="block">
          <div className="border border-input rounded-lg p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <h2 className="text-xl font-semibold">Exceptions</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              View and manage all exceptions across your projects
            </p>
            <Button variant="outline" className="gap-2">
              View Exceptions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
