'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRequireRole } from '@hooks/use-require-role';
import { usePlatforms } from '@hooks/use-platforms';
import { usePlatformMutations } from '@hooks/use-platform-mutations';
import { useToast } from '@hooks/use-toast';
import { UserRole, type PlatformDto, type CreatePlatformDto, type UpdatePlatformDto } from '@excepio/shared';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import {
  PlatformsTable,
  PlatformFormModal,
  DeletePlatformDialog,
  RegenerateKeyDialog,
} from '@components/platforms';
import { Plus } from 'lucide-react';
import { AxiosError } from 'axios';

export default function PlatformsPage() {
  const t = useTranslations('platforms');
  const { hasAccess, isChecking } = useRequireRole([UserRole.ADMINISTRADOR]);
  const { toast } = useToast();

  // Data fetching
  const { data: platforms, isLoading, error } = usePlatforms();
  const { createPlatform, updatePlatform, deletePlatform, regenerateApiKey, activatePlatform } = usePlatformMutations();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (isChecking) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  // Handlers
  const handleCreate = () => {
    setSelectedPlatform(null);
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleEdit = (platform: PlatformDto) => {
    setSelectedPlatform(platform);
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleDelete = (platform: PlatformDto) => {
    setSelectedPlatform(platform);
    setDeleteDialogOpen(true);
  };

  const handleRegenerateKey = (platform: PlatformDto) => {
    setSelectedPlatform(platform);
    setRegenerateDialogOpen(true);
  };

  const handleFormModalChange = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) {
      setFormError(null);
    }
  };

  const handleFormSubmit = async (
    data: { id?: number; name: string; icon?: string },
    isEdit: boolean
  ) => {
    setFormError(null);
    try {
      if (isEdit && selectedPlatform) {
        const updateData: UpdatePlatformDto = {
          name: data.name,
          icon: data.icon || null,
        };
        await updatePlatform.mutateAsync({ id: selectedPlatform.id, data: updateData });
        toast({
          title: t('edit.success'),
          variant: 'success',
        });
        setFormModalOpen(false);
      } else {
        const createData: CreatePlatformDto = {
          id: data.id!,
          name: data.name,
          icon: data.icon,
        };
        await createPlatform.mutateAsync(createData);
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
    if (!selectedPlatform) return;

    try {
      await deletePlatform.mutateAsync(selectedPlatform.id);
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

  const handleRegenerateConfirm = async () => {
    if (!selectedPlatform) return;

    try {
      await regenerateApiKey.mutateAsync(selectedPlatform.id);
      toast({
        title: t('apiKey.regenerated'),
        variant: 'success',
      });
      setRegenerateDialogOpen(false);
    } catch {
      toast({
        title: t('errors.regenerate'),
        variant: 'error',
      });
    }
  };

  const handleActivate = async (platform: PlatformDto) => {
    try {
      await activatePlatform.mutateAsync(platform.id);
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
      ) : platforms && platforms.length > 0 ? (
        <PlatformsTable
          platforms={platforms}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRegenerateKey={handleRegenerateKey}
          onActivate={handleActivate}
        />
      ) : (
        <div className="text-muted-foreground text-center py-12 border border-input rounded-lg">
          {t('empty')}
        </div>
      )}

      {/* Modals */}
      <PlatformFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalChange}
        platform={selectedPlatform}
        onSubmit={handleFormSubmit}
        isSubmitting={createPlatform.isPending || updatePlatform.isPending}
        error={formError}
      />

      <DeletePlatformDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        platform={selectedPlatform}
        onConfirm={handleDeleteConfirm}
        isDeleting={deletePlatform.isPending}
      />

      <RegenerateKeyDialog
        open={regenerateDialogOpen}
        onOpenChange={setRegenerateDialogOpen}
        platform={selectedPlatform}
        onConfirm={handleRegenerateConfirm}
        isRegenerating={regenerateApiKey.isPending}
      />
    </div>
  );
}
