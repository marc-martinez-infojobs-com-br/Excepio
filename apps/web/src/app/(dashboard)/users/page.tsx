'use client';

import { useTranslations } from 'next-intl';
import { useRequireRole } from '@hooks/use-require-role';
import { UserRole } from '@excepio/shared';

export default function UsersPage() {
  const t = useTranslations('navigation');
  const { hasAccess, isChecking } = useRequireRole([UserRole.ADMINISTRADOR]);

  if (isChecking) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t('users')}</h1>
    </div>
  );
}
