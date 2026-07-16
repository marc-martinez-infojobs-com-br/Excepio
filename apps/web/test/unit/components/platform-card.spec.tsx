import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlatformCard } from '@components/platforms/platform-card';
import type { PlatformDto } from '@excepio/shared';

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'platforms.status': {
        active: 'Activo',
        pending: 'Pendiente',
        expired: 'Expirado',
        deleted: 'Eliminado',
      },
      'platforms.apiKey': {
        show: 'Mostrar',
        hide: 'Ocultar',
        copy: 'Copiar',
        copied: 'Copiado',
        regenerate: 'Regenerar',
      },
      'platforms': {
        'table.createdAt': 'Creado',
        'edit.button': 'Editar',
        'delete.button': 'Eliminar',
        'activate.button': 'Activar',
      },
    };
    return translations[namespace]?.[key] || key;
  }),
}));



describe('PlatformCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnRegenerateKey = vi.fn();
  const mockOnActivate = vi.fn();

  const activePlatform: PlatformDto = {
    id: 1,
    name: 'Web Platform',
    icon: 'globe',
    apiKey: 'test-api-key-1234567890abcdef',
    statusId: 2,
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const deletedPlatform: PlatformDto = {
    ...activePlatform,
    id: 2,
    name: 'Deleted Platform',
    statusId: 4,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderizado básico', () => {
    it('debería renderizar el nombre de la plataforma', () => {
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('Web Platform')).toBeInTheDocument();
    });

    it('debería renderizar el badge de estado', () => {
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('debería renderizar la API key enmascarada', () => {
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      // La API key debe estar enmascarada
      expect(screen.getByText(/test-api/)).toBeInTheDocument();
      expect(screen.queryByText('test-api-key-1234567890abcdef')).not.toBeInTheDocument();
    });

    it('debería renderizar la fecha de creación', () => {
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText(/Creado:/)).toBeInTheDocument();
    });
  });

  describe('plataforma activa', () => {
    it('debería mostrar botones de Regenerar, Editar y Eliminar', () => {
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByLabelText('Regenerar')).toBeInTheDocument();
      expect(screen.getByLabelText('Editar')).toBeInTheDocument();
      expect(screen.getByLabelText('Eliminar')).toBeInTheDocument();
    });

    it('NO debería mostrar botón de Activar', () => {
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.queryByLabelText('Activar')).not.toBeInTheDocument();
    });

    it('debería llamar onEdit cuando se hace click en Editar', async () => {
      const user = userEvent.setup();
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      await user.click(screen.getByLabelText('Editar'));
      expect(mockOnEdit).toHaveBeenCalledWith(activePlatform);
    });

    it('debería llamar onDelete cuando se hace click en Eliminar', async () => {
      const user = userEvent.setup();
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      await user.click(screen.getByLabelText('Eliminar'));
      expect(mockOnDelete).toHaveBeenCalledWith(activePlatform);
    });

    it('debería llamar onRegenerateKey cuando se hace click en Regenerar', async () => {
      const user = userEvent.setup();
      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      await user.click(screen.getByLabelText('Regenerar'));
      expect(mockOnRegenerateKey).toHaveBeenCalledWith(activePlatform);
    });
  });

  describe('plataforma eliminada', () => {
    it('debería mostrar badge de Eliminado', () => {
      render(
        <PlatformCard
          platform={deletedPlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('Eliminado')).toBeInTheDocument();
    });

    it('debería mostrar solo botón de Activar', () => {
      render(
        <PlatformCard
          platform={deletedPlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByLabelText('Activar')).toBeInTheDocument();
      expect(screen.queryByLabelText('Editar')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Eliminar')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Regenerar')).not.toBeInTheDocument();
    });

    it('debería llamar onActivate cuando se hace click en Activar', async () => {
      const user = userEvent.setup();
      render(
        <PlatformCard
          platform={deletedPlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      await user.click(screen.getByLabelText('Activar'));
      expect(mockOnActivate).toHaveBeenCalledWith(deletedPlatform);
    });
  });

  describe('funcionalidad de API key', () => {
    it('debería copiar la API key al clipboard cuando se hace click en copiar', async () => {
      const user = userEvent.setup();
      
      // Mock del clipboard DESPUÉS de userEvent.setup()
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      render(
        <PlatformCard
          platform={activePlatform}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRegenerateKey={mockOnRegenerateKey}
          onActivate={mockOnActivate}
        />
      );

      const copyButton = screen.getByLabelText('Copiar');
      await user.click(copyButton);

      expect(writeTextMock).toHaveBeenCalledWith('test-api-key-1234567890abcdef');
    });
  });
});
