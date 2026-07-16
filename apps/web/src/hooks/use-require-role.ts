'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@hooks/use-auth';
import { toast } from '@hooks/use-toast';
import { UserRole } from '@excepio/shared';

interface UseRequireRoleResult {
  hasAccess: boolean;
  isChecking: boolean;
}

export function useRequireRole(allowedRoles: UserRole[]): UseRequireRoleResult {
  const t = useTranslations('errors');
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const userRole = user?.role;
    const isAllowed = userRole && allowedRoles.includes(userRole);

    if (isAllowed) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
      toast({
        title: t('accessDenied'),
        variant: 'error',
      });
      router.push('/dashboard');
    }
  }, [user, isLoading, allowedRoles, router, t]);

  return {
    hasAccess,
    isChecking: isLoading,
  };
}
