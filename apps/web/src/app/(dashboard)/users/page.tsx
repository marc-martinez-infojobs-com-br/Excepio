'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRequireRole } from '@hooks/use-require-role';
import { useUsers } from '@hooks/use-users';
import { useUserMutations } from '@hooks/use-user-mutations';
import { useToast } from '@hooks/use-toast';
import { useAuth } from '@hooks/use-auth';
import { UserRole, type UserResponseDto, type CreateUserDto, type UpdateUserDto } from '@excepio/shared';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import {
  UsersTable,
  UserFormModal,
  DeleteUserDialog,
} from '@components/users';
import { Plus } from 'lucide-react';
import { AxiosError } from 'axios';

export default function UsersPage() {
  const t = useTranslations('users');
  const { hasAccess, isChecking } = useRequireRole([UserRole.ADMINISTRADOR]);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Data fetching
  const { data: users, isLoading, error } = useUsers();
  const { createUser, updateUser, deleteUser, activateUser } = useUserMutations();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (isChecking) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  // Handlers
  const handleCreate = () => {
    setSelectedUser(null);
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleEdit = (user: UserResponseDto) => {
    setSelectedUser(user);
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleDelete = (user: UserResponseDto) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleFormModalChange = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) {
      setFormError(null);
    }
  };

  const handleFormSubmit = async (
    data: { name: string; email: string; password?: string; role: UserRole },
    isEdit: boolean
  ) => {
    setFormError(null);
    try {
      if (isEdit && selectedUser) {
        const updateData: UpdateUserDto = {
          name: data.name,
          role: data.role,
        };
        await updateUser.mutateAsync({ id: selectedUser.id, data: updateData });
        toast({
          title: t('edit.success'),
          variant: 'success',
        });
        setFormModalOpen(false);
      } else {
        const createData: CreateUserDto = {
          email: data.email,
          password: data.password!,
          name: data.name,
          role: data.role,
        };
        await createUser.mutateAsync(createData);
        toast({
          title: t('create.success'),
          variant: 'success',
        });
        setFormModalOpen(false);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || (isEdit ? t('errors.update') : t('errors.create'));
      setFormError(errorMessage);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync(selectedUser.id);
      toast({
        title: t('delete.success'),
        variant: 'success',
      });
      setDeleteDialogOpen(false);
    } catch {
      toast({
        title: t('errors.delete'),
        variant: 'error',
      });
    }
  };

  const handleActivate = async (user: UserResponseDto) => {
    try {
      await activateUser.mutateAsync(user.id);
      toast({
        title: t('activate.success'),
        variant: 'success',
      });
    } catch {
      toast({
        title: t('errors.activate'),
        variant: 'error',
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('create.button')}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="border border-input rounded-lg overflow-hidden">
          <div className="space-y-0">
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{t('errors.loading')}</div>
      ) : users && users.length > 0 ? (
        <UsersTable
          users={users}
          currentUserId={currentUser?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
        />
      ) : (
        <div className="text-muted-foreground text-center py-12 border border-input rounded-lg">
          {t('empty')}
        </div>
      )}

      {/* Modals */}
      <UserFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalChange}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        isSubmitting={createUser.isPending || updateUser.isPending}
        error={formError}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteUser.isPending}
      />
    </div>
  );
}
