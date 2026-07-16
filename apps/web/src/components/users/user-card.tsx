'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Pencil, Trash2, RotateCcw, KeyRound } from 'lucide-react';
import type { UserResponseDto } from '@excepio/shared';
import { UserRole } from '@excepio/shared';

interface UserCardProps {
  user: UserResponseDto;
  currentUserId?: string;
  onEdit: (user: UserResponseDto) => void;
  onDelete: (user: UserResponseDto) => void;
  onActivate: (user: UserResponseDto) => void;
  onResetPassword: (user: UserResponseDto) => void;
}

function RoleBadge({ role }: { role: UserRole }) {
  const t = useTranslations('users.roles');

  const roleConfig: Record<UserRole, { label: string; variant: 'default' | 'secondary' }> = {
    [UserRole.ADMINISTRADOR]: { label: t('ADMINISTRADOR'), variant: 'default' },
    [UserRole.USUARIO]: { label: t('USUARIO'), variant: 'secondary' },
  };

  const config = roleConfig[role];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function StatusBadge({ statusId }: { statusId: number }) {
  const t = useTranslations('users.status');

  const statusConfig: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    1: { label: t('pending'), variant: 'secondary' },
    2: { label: t('active'), variant: 'default' },
    3: { label: t('expired'), variant: 'outline' },
    4: { label: t('deleted'), variant: 'destructive' },
  };

  const config = statusConfig[statusId] || { label: 'Unknown', variant: 'outline' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function formatLastLogin(lastLoginAt: string | null, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (!lastLoginAt) return '-';
  
  const date = new Date(lastLoginAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return t('timeAgo.minutes', { count: diffMins.toString() });
  } else if (diffHours < 24) {
    return t('timeAgo.hours', { count: diffHours.toString() });
  } else if (diffDays < 7) {
    return t('timeAgo.days', { count: diffDays.toString() });
  } else {
    return date.toLocaleDateString();
  }
}

export function UserCard({
  user,
  currentUserId,
  onEdit,
  onDelete,
  onActivate,
  onResetPassword,
}: UserCardProps) {
  const t = useTranslations('users');

  const isDeleted = user.statusId === 4;
  const isCurrentUser = user.id === currentUserId;

  return (
    <div className="border border-input rounded-lg p-3 bg-card">
      {/* Header: Role Badge (small) + Name + Status Badge */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col gap-1">
          <div className="scale-75 origin-left">
            <RoleBadge role={user.role} />
          </div>
          <span className="font-semibold text-base">{user.name}</span>
        </div>
        <StatusBadge statusId={user.statusId} />
      </div>

      {/* Email */}
      <div className="mb-2">
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      {/* Info: Last Login (left) + Created At (right) - single line */}
      <div className="mb-2 text-xs text-muted-foreground flex justify-between">
        <span>{t('table.lastLogin')}: {formatLastLogin(user.lastLoginAt, t)}</span>
        <span>{t('table.createdAt')}: {new Date(user.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        {!isDeleted && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResetPassword(user)}
              className="flex-1 gap-1"
              aria-label={t('resetPassword.button')}
            >
              <KeyRound className="h-4 w-4" />
              {t('resetPassword.buttonShort')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
              className="flex-1 gap-1"
              aria-label={t('edit.button')}
            >
              <Pencil className="h-4 w-4" />
              {t('edit.button')}
            </Button>
            {!isCurrentUser && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(user)}
                className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                aria-label={t('delete.button')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        {isDeleted && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onActivate(user)}
            className="w-full gap-1 text-green-600 hover:text-green-600"
            aria-label={t('activate.button')}
          >
            <RotateCcw className="h-4 w-4" />
            {t('activate.button')}
          </Button>
        )}
      </div>
    </div>
  );
}
