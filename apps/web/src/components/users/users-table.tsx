'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { Pencil, Trash2, RotateCcw, KeyRound } from 'lucide-react';
import type { UserResponseDto } from '@excepio/shared';
import { UserRole } from '@excepio/shared';

interface UsersTableProps {
  users: UserResponseDto[];
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

function formatLastLogin(lastLoginAt: string | null): string {
  if (!lastLoginAt) return '-';
  
  const date = new Date(lastLoginAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function UsersTable({
  users,
  currentUserId,
  onEdit,
  onDelete,
  onActivate,
  onResetPassword,
}: UsersTableProps) {
  const t = useTranslations('users');

  const isDeleted = (user: UserResponseDto) => user.statusId === 4;
  const isCurrentUser = (user: UserResponseDto) => user.id === currentUserId;

  return (
    <div className="border border-input rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.name')}
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.email')}
            </TableHead>
            <TableHead className="w-32 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.role')}
            </TableHead>
            <TableHead className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.status')}
            </TableHead>
            <TableHead className="w-32 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.lastLogin')}
            </TableHead>
            <TableHead className="w-32 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.createdAt')}
            </TableHead>
            <TableHead className="w-32 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-b border-border">
              <TableCell className="font-medium py-4">{user.name}</TableCell>
              <TableCell className="text-muted-foreground py-4">{user.email}</TableCell>
              <TableCell className="py-4">
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="py-4">
                <StatusBadge statusId={user.statusId} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm py-4">
                {formatLastLogin(user.lastLoginAt)}
              </TableCell>
              <TableCell className="text-muted-foreground py-4">
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center justify-end gap-1">
                  {!isDeleted(user) && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('edit.button')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onResetPassword(user)}
                              className="h-8 w-8 p-0"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('resetPassword.button')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {!isCurrentUser(user) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(user)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('delete.button')}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </>
                  )}
                  {isDeleted(user) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onActivate(user)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-600"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('activate.button')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
